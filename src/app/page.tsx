import { HomeCatalog } from '@/components/store/home-catalog';
import { pickRandomBanners, resolveHomeBanners } from '@/lib/banners';
import { getActiveProducts } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import { mockProducts, type StoreProduct } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Empty until DB responds — never keep mock samples when catalog is intentionally empty
  let products: StoreProduct[] = [];
  let banners = pickRandomBanners(3);

  try {
    products = await getActiveProducts();
  } catch (error) {
    console.warn('Catalog unavailable — using sample products', error);
    products = mockProducts;
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

  return <HomeCatalog products={products} banners={banners} />;
}
