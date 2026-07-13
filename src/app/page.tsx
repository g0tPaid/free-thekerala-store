import { HomeCatalog } from '@/components/store/home-catalog';
import { pickRandomBanners } from '@/lib/banners';
import { mockProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomeCatalog products={mockProducts} banners={pickRandomBanners(3)} />;
}
