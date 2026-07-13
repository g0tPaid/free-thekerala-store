import { HomeCatalog } from '@/components/store/home-catalog';
import { pickRandomBanners, resolveHomeBanners } from '@/lib/banners';
import { getActiveProducts } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import { mockProducts, type StoreProduct } from '@/lib/products';

/** Dynamic so builds do not need DATABASE_URL; catalog is cached at runtime. */
export const dynamic = 'force-dynamic';

function plainProducts(products: StoreProduct[]): StoreProduct[] {
  // Ensure RSC props are plain JSON (no Prisma/Decimal leftovers).
  return JSON.parse(JSON.stringify(products)) as StoreProduct[];
}

export default async function Home() {
  let products: StoreProduct[] = mockProducts;
  let banners = pickRandomBanners(3);

  try {
    const live = await getActiveProducts();
    if (live.length) products = live;
  } catch (error) {
    console.warn('Catalog DB unavailable — showing sample products', error);
  }

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: {
        banner1Url: true,
        banner2Url: true,
        banner3Url: true,
        banner1Link: true,
        banner2Link: true,
        banner3Link: true,
      },
    });
    banners = resolveHomeBanners(settings);
  } catch (error) {
    console.warn('Banner settings unavailable — using random banners', error);
    banners = pickRandomBanners(3);
  }

  return <HomeCatalog products={plainProducts(products)} banners={banners} />;
}
