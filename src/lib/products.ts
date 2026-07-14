import { slugify } from '@/lib/utils';

/** Storefront category pills — built from live catalog; these are display labels only */
export const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'ALL',
  HOME: 'HOME',
  SPICES: 'SPICES',
  FOOD: 'FOOD',
  CARE: 'CARE',
  APPAREL: 'APPAREL',
};

export const VIEWS = ['ALL', 'WOMEN', 'KIDS', 'MEN'] as const;
export const AUDIENCE_VIEWS = ['WOMEN', 'KIDS', 'MEN'] as const;

export type ProductCategory = string;
export type ProductView = (typeof VIEWS)[number];
export type AudienceView = (typeof AUDIENCE_VIEWS)[number];
export type LeafCategory = string;
export type CatalogLine = 'WOMEN' | 'KIDS' | 'MEN';

export const VIEW_LABELS: Record<ProductView, string> = {
  ALL: 'ALL',
  WOMEN: '🌸 WOMEN',
  KIDS: '🧒 KIDS',
  MEN: '💙 MEN',
};

export function categoryLabel(category: string) {
  const key = category.trim().toUpperCase();
  return CATEGORY_LABELS[key] ?? key;
}

export const QUALITY_OPTIONS = [
  { id: 'NORMAL', label: 'Standard', multiplier: 1 },
  { id: 'GOOD', label: 'Premium', multiplier: 1.2 },
  { id: 'HIGH', label: 'Artisan', multiplier: 1.45 },
  { id: 'ONE_TO_ONE', label: 'Heritage', multiplier: 1.75 },
  { id: 'MIRROR', label: 'Collector', multiplier: 2.1 },
] as const;

export type QualityOptionId = (typeof QUALITY_OPTIONS)[number]['id'];

export type QualityPriceMap = Partial<Record<QualityOptionId, number | null>>;

export function getQualityOption(id: QualityOptionId | string | undefined) {
  return QUALITY_OPTIONS.find((option) => option.id === id) ?? QUALITY_OPTIONS[0];
}

export function parseQualityPrices(value: unknown): QualityPriceMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const source = value as Record<string, unknown>;
  const prices: QualityPriceMap = {};

  for (const option of QUALITY_OPTIONS) {
    const raw = source[option.id];
    if (raw === null || raw === undefined || raw === '') continue;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      prices[option.id] = parsed;
    }
  }

  return prices;
}

export function priceForQuality(
  basePrice: number,
  qualityId: QualityOptionId | string | undefined,
  qualityPrices?: QualityPriceMap | null,
) {
  const quality = getQualityOption(qualityId);
  const custom = qualityPrices?.[quality.id];
  if (typeof custom === 'number' && Number.isFinite(custom)) {
    return Math.round(custom * 100) / 100;
  }
  return Math.round(basePrice * quality.multiplier * 100) / 100;
}

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice?: number | null;
  qualityPrices?: QualityPriceMap;
  /** WOMEN / KIDS / MEN catalog line (from parent category in admin) */
  line: CatalogLine;
  category: LeafCategory;
  description: string;
  material: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  /** Ordered gallery (cover = first image) */
  images: string[];
  featured?: boolean;
  /** Featured slot 1–3 within this audience line (WOMEN / KIDS / MEN) */
  homepageOrder?: number | null;
  newArrival?: boolean;
};

type DecimalLike = number | string | { toString: () => string } | null | undefined;

type PrismaMediaShape = {
  url?: string | null;
  kind?: string | null;
  alt?: string | null;
  sortOrder?: number | null;
};

type PrismaCategoryShape = {
  name?: string | null;
  slug?: string | null;
  parent?: {
    name?: string | null;
    slug?: string | null;
  } | null;
};

export type PrismaProductShape = {
  id: string;
  slug?: string | null;
  name: string;
  price: DecimalLike;
  salePrice?: DecimalLike;
  qualityPrices?: unknown;
  shortDescription?: string | null;
  longDescription?: string | null;
  material?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  tags?: string[] | null;
  featured?: boolean | null;
  homepageOrder?: number | null;
  newArrival?: boolean | null;
  category?: PrismaCategoryShape | null;
  media?: PrismaMediaShape[] | null;
};

const ITEM_PHOTOS = [
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1620916569873-f1f3c0b1c1e8?auto=format&fit=crop&w=900&q=80',
];

function mockImage(label: string, bg = 'f3efe6') {
  return `https://placehold.co/900x1200/${bg}/1d4d3e?text=${encodeURIComponent(label)}`;
}

function toNumber(value: DecimalLike) {
  if (value === null || value === undefined) return 0;
  const parsed = Number(typeof value === 'object' ? value.toString() : value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Max featured homepage slots per audience line (WOMEN / KIDS / MEN each). */
export const MAX_FEATURED_PER_LINE = 3;

export function catalogLineFromCategory(category?: PrismaCategoryShape | null): CatalogLine {
  return toCatalogLine(category);
}

function toCatalogLine(category?: PrismaCategoryShape | null): CatalogLine {
  // Exact parent / leaf slug first — never use substring "MEN" inside "WOMEN"
  const parentSlug = (category?.parent?.slug || '').toLowerCase();
  const leafSlug = (category?.slug || '').toLowerCase();
  const parentName = (category?.parent?.name || '').trim().toUpperCase();
  const leafName = (category?.name || '').trim().toUpperCase();

  for (const token of [parentSlug, leafSlug]) {
    if (token === 'kids' || token === 'kid' || token === 'children') return 'KIDS';
    if (token === 'women' || token === 'woman' || token === 'ladies') return 'WOMEN';
    if (token === 'men' || token === 'man' || token === 'male' || token === 'gifts') return 'MEN';
    if (token === 'shop') return 'WOMEN';
  }

  for (const token of [parentName, leafName]) {
    if (token === 'KIDS' || token === 'KID' || token === 'CHILDREN') return 'KIDS';
    if (token === 'WOMEN' || token === 'WOMAN' || token === 'LADIES') return 'WOMEN';
    if (token === 'MEN' || token === 'MAN' || token === 'MALE') return 'MEN';
  }

  const bits = [parentSlug, leafSlug, parentName, leafName].filter(Boolean).join(' ').toUpperCase();
  if (/\bKIDS?\b|\bCHILD/.test(bits)) return 'KIDS';
  if (/\bWOMEN\b|\bWOMAN\b|\bLADIES\b|\bGIRL/.test(bits)) return 'WOMEN';
  if (/\bMEN\b|\bMALE\b|\bMAN\b|\bGIFT/.test(bits)) return 'MEN';
  return 'WOMEN';
}

function toCategory(category?: PrismaCategoryShape | null): LeafCategory {
  const name = category?.name?.trim();
  if (name) return name.toUpperCase();

  const slug = (category?.slug || '').trim().toLowerCase();
  if (!slug) return 'OTHER';

  const leaf = slug.replace(/^(women|kids|men)-/, '').replace(/-/g, ' ');
  return leaf.toUpperCase() || 'OTHER';
}

export function mapPrismaProductToStore(product: PrismaProductShape): StoreProduct {
  const media = [...(product.media ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const gallery = media.map((image) => image.url).filter(Boolean) as string[];
  const fallback = mockImage(product.name, 'f3efe6');

  return {
    id: product.id,
    slug: product.slug || slugify(product.name),
    name: product.name,
    price: toNumber(product.price),
    salePrice: product.salePrice ? toNumber(product.salePrice) : null,
    qualityPrices: parseQualityPrices(product.qualityPrices),
    line: toCatalogLine(product.category),
    category: toCategory(product.category),
    description:
      product.longDescription ||
      product.shortDescription ||
      'Curated from Kerala — craft, spice, and everyday beauty for your home.',
    material: product.material || 'Natural materials',
    sizes: Array.isArray(product.sizes) ? (product.sizes as string[]) : [],
    colors: product.colors?.length ? product.colors : ['Natural', 'Ivory'],
    tags: product.tags ?? [],
    images: gallery.length ? gallery : [fallback],
    featured: Boolean(product.featured),
    homepageOrder:
      typeof product.homepageOrder === 'number' && Number.isFinite(product.homepageOrder)
        ? product.homepageOrder
        : null,
    newArrival: Boolean(product.newArrival),
  };
}

export const mockProducts: StoreProduct[] = [
  {
    id: 'ks-001',
    slug: 'malabar-pepper-jar',
    name: 'Malabar Black Pepper',
    price: 48,
    line: 'WOMEN',
    category: 'SPICES',
    description: 'Whole peppercorns from the Malabar coast — fragrant, sharp, and pantry-ready.',
    material: 'Whole black pepper',
    sizes: ['100g', '250g'],
    colors: ['Natural'],
    tags: ['spice', 'pepper'],
    images: [ITEM_PHOTOS[0]],
    featured: true,
    newArrival: true,
  },
  {
    id: 'ks-002',
    slug: 'cardamom-green-pods',
    name: 'Green Cardamom Pods',
    price: 62,
    line: 'WOMEN',
    category: 'SPICES',
    description: 'Aromatic green cardamom for chai, sweets, and slow cooking.',
    material: 'Dried green cardamom',
    sizes: ['50g', '100g'],
    colors: ['Green'],
    tags: ['spice', 'cardamom'],
    images: [ITEM_PHOTOS[1]],
    featured: true,
  },
  {
    id: 'ks-003',
    slug: 'nilgiri-tea-tin',
    name: 'Nilgiri Leaf Tea',
    price: 54,
    line: 'WOMEN',
    category: 'FOOD',
    description: 'High-grown leaf tea with a clean, floral cup — morning ritual ready.',
    material: 'Black tea leaves',
    sizes: ['100g', '250g'],
    colors: ['Natural'],
    tags: ['tea', 'food'],
    images: [ITEM_PHOTOS[2]],
  },
  {
    id: 'ks-004',
    slug: 'kasavu-stole',
    name: 'Kasavu Stole',
    price: 186,
    line: 'MEN',
    category: 'APPAREL',
    description: 'Handloom stole with classic golden border — light enough for everyday wear.',
    material: 'Cotton handloom',
    sizes: ['ONE SIZE'],
    colors: ['Ivory', 'Gold'],
    tags: ['apparel', 'kasavu'],
    images: [ITEM_PHOTOS[7]],
    featured: true,
  },
  {
    id: 'ks-005',
    slug: 'brass-nilavilakku',
    name: 'Brass Nilavilakku',
    price: 220,
    line: 'MEN',
    category: 'HOME',
    description: 'Traditional brass lamp for home rituals and warm evening light.',
    material: 'Solid brass',
    sizes: ['ONE SIZE'],
    colors: ['Brass'],
    tags: ['home', 'gift'],
    images: [ITEM_PHOTOS[5]],
    featured: true,
  },
  {
    id: 'ks-006',
    slug: 'coconut-oil-care',
    name: 'Virgin Coconut Oil',
    price: 72,
    line: 'WOMEN',
    category: 'CARE',
    description: 'Cold-pressed coconut oil for hair, skin, and kitchen — pure and simple.',
    material: 'Virgin coconut oil',
    sizes: ['250ml', '500ml'],
    colors: ['Natural'],
    tags: ['care', 'oil'],
    images: [ITEM_PHOTOS[6]],
  },
  {
    id: 'ks-007',
    slug: 'ayurvedic-soap-set',
    name: 'Ayurvedic Soap Trio',
    price: 58,
    line: 'KIDS',
    category: 'CARE',
    description: 'Three gentle soaps with herbal blends — a small gift of everyday care.',
    material: 'Herbal soap base',
    sizes: ['SET'],
    colors: ['Assorted'],
    tags: ['care', 'gift'],
    images: [ITEM_PHOTOS[4]],
    newArrival: true,
  },
  {
    id: 'ks-008',
    slug: 'coir-market-basket',
    name: 'Coir Market Basket',
    price: 95,
    line: 'WOMEN',
    category: 'HOME',
    description: 'Handwoven coir basket for market runs and tidy storage at home.',
    material: 'Natural coir',
    sizes: ['ONE SIZE'],
    colors: ['Natural'],
    tags: ['home', 'coir'],
    images: [ITEM_PHOTOS[4]],
  },
];

const LINE_ORDER: Record<CatalogLine, number> = {
  WOMEN: 0,
  KIDS: 1,
  MEN: 2,
};

/**
 * Homepage grid order.
 * On ALL: interleave featured slots across lines — Women #1, Kids #1, Men #1, then #2s, then #3s.
 * On a line tab: featured by slot within that line only.
 */
export function compareStoreProductsForGrid(
  a: StoreProduct,
  b: StoreProduct,
  view: ProductView = 'ALL',
) {
  const aFeatured = Boolean(a.featured);
  const bFeatured = Boolean(b.featured);
  if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
  if (!aFeatured) return 0;

  const aSlot = a.homepageOrder ?? 999;
  const bSlot = b.homepageOrder ?? 999;
  if (aSlot !== bSlot) return aSlot - bSlot;

  if (view === 'ALL') {
    return LINE_ORDER[a.line] - LINE_ORDER[b.line];
  }

  return 0;
}

export function filterProducts(
  products: StoreProduct[],
  category = 'ALL',
  view: ProductView = 'ALL',
) {
  const selected = category.toUpperCase();
  const byLine =
    view === 'ALL' ? products : products.filter((product) => product.line === view);

  const filtered =
    selected === 'ALL' ? byLine : byLine.filter((product) => product.category === selected);

  return filtered.map((product) => ({
    ...product,
    image: product.images[0],
  }));
}

/** Category pills for a view — only categories that have products (plus ALL). */
export function categoriesForView(products: StoreProduct[], view: ProductView): ProductCategory[] {
  const found = new Set<string>();
  for (const product of products) {
    if (view !== 'ALL' && product.line !== view) continue;
    if (product.category) found.add(product.category.toUpperCase());
  }
  return ['ALL', ...Array.from(found).sort((a, b) => a.localeCompare(b))];
}

export function getProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug);
}
