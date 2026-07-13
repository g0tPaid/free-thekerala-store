import { slugify } from '@/lib/utils';

/** Storefront category pills */
export const CATEGORIES = [
  'ALL',
  'HOME',
  'SPICES',
  'FOOD',
  'CARE',
  'APPAREL',
] as const;

export const VIEWS = ['SHOP', 'GIFTS'] as const;

export type ProductCategory = (typeof CATEGORIES)[number];
export type ProductView = (typeof VIEWS)[number];
export type LeafCategory = Exclude<ProductCategory, 'ALL'>;
export type CatalogLine = 'SHOP' | 'GIFT';

export const VIEW_LABELS: Record<ProductView, string> = {
  SHOP: 'SHOP · ഷോപ്പ്',
  GIFTS: 'GIFTS · സമ്മാനങ്ങൾ',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ALL: 'ALL · എല്ലാം',
  HOME: 'HOME · വീട്',
  SPICES: 'SPICES · മസാല',
  FOOD: 'FOOD · ഭക്ഷണം',
  CARE: 'CARE · പരിചരണം',
  APPAREL: 'APPAREL · വസ്ത്രം',
};

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
  /** SHOP or GIFTS catalog line (from parent category in admin) */
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

function toCatalogLine(category?: PrismaCategoryShape | null): CatalogLine {
  const bits = [
    category?.slug,
    category?.name,
    category?.parent?.slug,
    category?.parent?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  if (bits.includes('GIFT')) return 'GIFT';
  return 'SHOP';
}

function toCategory(input?: string | null): LeafCategory {
  const normalized = (input || '').toUpperCase().replace(/_/g, '-').replace(/\s+/g, '-');
  if (normalized.includes('SPICE') || normalized.includes('MASALA')) return 'SPICES';
  if (normalized.includes('FOOD') || normalized.includes('BEVERAGE') || normalized.includes('TEA')) {
    return 'FOOD';
  }
  if (
    normalized.includes('CARE') ||
    normalized.includes('BEAUTY') ||
    normalized.includes('PERSONAL') ||
    normalized.includes('AYUR')
  ) {
    return 'CARE';
  }
  if (
    normalized.includes('APPAREL') ||
    normalized.includes('CLOTH') ||
    normalized.includes('SARI') ||
    normalized.includes('FASHION')
  ) {
    return 'APPAREL';
  }
  if (
    normalized.includes('HOME') ||
    normalized.includes('LIVING') ||
    normalized.includes('DECOR') ||
    normalized.includes('JEWEL')
  ) {
    return 'HOME';
  }
  return 'HOME';
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
    category: toCategory(product.category?.slug || product.category?.name || product.tags?.[0]),
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
    newArrival: Boolean(product.newArrival),
  };
}

export const mockProducts: StoreProduct[] = [
  {
    id: 'ks-001',
    slug: 'malabar-pepper-jar',
    name: 'Malabar Black Pepper',
    price: 48,
    line: 'SHOP',
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
    line: 'SHOP',
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
    line: 'SHOP',
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
    line: 'SHOP',
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
    line: 'GIFT',
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
    line: 'SHOP',
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
    line: 'GIFT',
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
    line: 'SHOP',
    category: 'HOME',
    description: 'Handwoven coir basket for market runs and tidy storage at home.',
    material: 'Natural coir',
    sizes: ['ONE SIZE'],
    colors: ['Natural'],
    tags: ['home', 'coir'],
    images: [ITEM_PHOTOS[4]],
  },
];

export function filterProducts(
  products: StoreProduct[],
  category = 'ALL',
  view: ProductView = 'SHOP',
) {
  const selected = category.toUpperCase();
  const line: CatalogLine = view === 'GIFTS' ? 'GIFT' : 'SHOP';

  const byLine = products.filter((product) => product.line === line);

  const filtered =
    selected === 'ALL' ? byLine : byLine.filter((product) => product.category === selected);

  return filtered.map((product) => ({
    ...product,
    image: product.images[0],
  }));
}

export function getProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug);
}
