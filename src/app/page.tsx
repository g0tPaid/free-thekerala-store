import { HomeCatalog } from '@/components/store/home-catalog';
import { pickRandomBanners, resolveHomeBanners } from '@/lib/banners';
import { getActiveProducts } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import { mockProducts } from '@/lib/products';

/** Dynamic so builds do not need DATABASE_URL; catalog is cached at runtime. */
export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = mockProducts;
  let banners = pickRandomBanners(3);

  try {
    products = await getActiveProducts();
    if (!products.length) products = mockProducts;
  } catch (error) {
    console.warn('Catalog DB unavailable — showing sample products', error);
  }

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    banners = resolveHomeBanners(settings as never);
  } catch (error) {
    console.warn('Banner settings unavailable — using random banners', error);
    banners = pickRandomBanners(3);
  }

  return <HomeCatalog products={products} banners={banners} />;
}
