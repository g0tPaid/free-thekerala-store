import { revalidatePath, revalidateTag } from 'next/cache';

import { ProductStatus } from '@/generated/prisma';
import { CATALOG_CACHE_TAG } from '@/lib/catalog';
import {
  catalogLineFromCategory,
  maxFeaturedForLine,
  type CatalogLine,
} from '@/lib/products';
import { prisma } from '@/lib/prisma';
import { saveUploadedImage } from '@/lib/uploads';

const categoryLineSelect = {
  name: true,
  slug: true,
  parent: { select: { name: true, slug: true } },
} as const;

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function optionalString(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value.length ? value : null;
}

function csvValue(formData: FormData, key: string) {
  return stringValue(formData, key)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(stringValue(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function optionalNumber(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!(value instanceof File)) return null;
  if (!value.size) return null;
  return value;
}

function productData(formData: FormData) {
  const name = stringValue(formData, 'name');
  const slug = stringValue(formData, 'slug') || slugify(name);

  if (!name) {
    throw new Error('Product name is required.');
  }

  return {
    name,
    slug,
    shortDescription: optionalString(formData, 'shortDescription'),
    longDescription: optionalString(formData, 'longDescription'),
    brand: optionalString(formData, 'brand') ?? 'The Kerala Store',
    price: numberValue(formData, 'price'),
    salePrice: optionalNumber(formData, 'salePrice'),
    qualityPrices: {},
    sku: optionalString(formData, 'sku'),
    stock: numberValue(formData, 'stock', 1000),
    sizes: csvValue(formData, 'sizes'),
    colors: csvValue(formData, 'colors'),
    tags: csvValue(formData, 'tags'),
    weight: optionalNumber(formData, 'weight'),
    material: optionalString(formData, 'material'),
    status: (stringValue(formData, 'status') || 'ACTIVE') as ProductStatus,
    featured: formData.get('featured') === 'on',
    newArrival: formData.get('newArrival') === 'on',
    homepageOrder: null as number | null,
    categoryId: optionalString(formData, 'categoryId'),
  };
}

async function resolveCatalogLine(categoryId: string | null | undefined): Promise<CatalogLine> {
  if (!categoryId) return 'WOMEN';
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: categoryLineSelect,
  });
  return catalogLineFromCategory(category);
}

async function countFeaturedInLine(line: CatalogLine, excludeId?: string) {
  const featured = await prisma.product.findMany({
    where: {
      featured: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: {
      id: true,
      category: { select: categoryLineSelect },
    },
  });
  return featured.filter((product) => catalogLineFromCategory(product.category) === line).length;
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug || `product-${Date.now()}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${baseSlug}-${attempt + 2}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

async function resolveImageUrl(formData: FormData, fileKey: string, existingKey: string) {
  const uploaded = await saveUploadedImage(fileValue(formData, fileKey));
  if (uploaded) return uploaded;
  return optionalString(formData, existingKey);
}

async function replaceProductMedia(productId: string, formData: FormData) {
  const MAX_IMAGES = 15;
  const productName = stringValue(formData, 'name') || 'Product';
  const urls: string[] = [];

  for (let index = 0; index < MAX_IMAGES; index += 1) {
    const url = await resolveImageUrl(formData, `image${index}`, `existingImageUrl${index}`);
    if (url) urls.push(url);
  }

  await prisma.productMedia.deleteMany({ where: { productId } });
  if (!urls.length) return;

  await prisma.productMedia.createMany({
    data: urls.map((url, sortOrder) => ({
      productId,
      url,
      kind: 'ITEM',
      alt: `${productName} image ${sortOrder + 1}`,
      sortOrder,
    })),
  });
}

function bustCatalogCache(slug?: string) {
  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath('/manage/products');
  if (slug) revalidatePath(`/product/${slug}`);
}

export function formatProductSaveError(error: unknown) {
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (message.includes('Unique constraint') && message.includes('slug')) {
      return 'A product with this slug already exists. Change the name/slug and try again.';
    }
    if (message.includes('Unique constraint') && message.includes('sku')) {
      return 'This SKU is already used. Clear SKU or use a different one.';
    }
    if (message.includes('Unique constraint')) {
      return 'This product conflicts with an existing one (slug or SKU). Change it and try again.';
    }
    return message;
  }
  return 'Could not save product. Try fewer or smaller images.';
}

export async function createProductFromFormData(formData: FormData) {
  const data = productData(formData);
  const wantsFeatured = data.featured;
  const line = wantsFeatured ? await resolveCatalogLine(data.categoryId) : null;

  if (wantsFeatured && line) {
    const featuredCount = await countFeaturedInLine(line);
    if (featuredCount >= maxFeaturedForLine(line)) {
      throw new Error(
        `Already ${maxFeaturedForLine(line)} featured ${line} products. Remove one from that line's slots, then try again.`,
      );
    }
  }

  data.slug = await ensureUniqueSlug(data.slug);

  const product = await prisma.product.create({
    data: {
      ...data,
      homepageOrder: wantsFeatured && line ? maxFeaturedForLine(line) + 1 : null,
    },
  });

  await replaceProductMedia(product.id, formData);
  bustCatalogCache(product.slug);
  return product;
}

export async function updateProductFromFormData(id: string, formData: FormData) {
  const data = productData(formData);
  const wantsFeatured = data.featured;
  const line = wantsFeatured ? await resolveCatalogLine(data.categoryId) : null;

  if (wantsFeatured && line) {
    const featuredCount = await countFeaturedInLine(line, id);
    if (featuredCount >= maxFeaturedForLine(line)) {
      throw new Error(
        `Already ${maxFeaturedForLine(line)} featured ${line} products. Remove one from that line's slots, then try again.`,
      );
    }
  }

  data.slug = await ensureUniqueSlug(data.slug, id);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      homepageOrder: wantsFeatured && line ? maxFeaturedForLine(line) + 1 : null,
    },
  });

  await replaceProductMedia(id, formData);
  revalidatePath(`/manage/products/edit/${id}`);
  bustCatalogCache(data.slug);
  return product;
}
