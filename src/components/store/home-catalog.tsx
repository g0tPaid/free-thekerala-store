'use client';

import { useMemo, useState } from 'react';
import { CategoryNav } from '@/components/store/category-nav';
import { Header } from '@/components/store/header';
import { HeroBanners } from '@/components/store/hero-banners';
import { OffersBanner } from '@/components/store/offers-banner';
import { ProductGrid } from '@/components/store/product-grid';
import { SearchOverlay } from '@/components/store/search-overlay';
import { ViewToggle } from '@/components/store/view-toggle';
import type { HomeBanner } from '@/lib/banners';
import { useWhatsappUrl } from '@/components/providers';
import { BRAND } from '@/lib/brand';
import {
  categoriesForView,
  compareStoreProductsForGrid,
  filterProducts,
  type ProductCategory,
  type ProductView,
  type StoreProduct,
} from '@/lib/products';

const PAGE_SIZE = 12;
const MID_TICKER_AFTER = 6;

type HomeCatalogProps = {
  products: StoreProduct[];
  banners: HomeBanner[];
  bannersEnabled?: boolean;
};

export function HomeCatalog({
  products: catalog,
  banners,
  bannersEnabled = true,
}: HomeCatalogProps) {
  const waUrl = useWhatsappUrl();
  const [category, setCategory] = useState<ProductCategory>('ALL');
  const [view, setView] = useState<ProductView>('ALL');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const availableCategories = useMemo(
    () => categoriesForView(catalog, view),
    [catalog, view],
  );

  const filtered = useMemo(() => {
    const sorted = filterProducts(catalog, category, view)
      .slice()
      .sort((a, b) => compareStoreProductsForGrid(a, b, view));

    // On the main ALL feed, alternate Women / Kids after the first 6 featured
    if (view !== 'ALL' || category !== 'ALL') return sorted;

    const head = sorted.slice(0, MID_TICKER_AFTER);
    const tail = sorted.slice(MID_TICKER_AFTER);
    const women = tail.filter((product) => product.line === 'WOMEN');
    const kids = tail.filter((product) => product.line === 'KIDS');
    const others = tail.filter(
      (product) => product.line !== 'WOMEN' && product.line !== 'KIDS',
    );

    const alternated: typeof tail = [];
    const longest = Math.max(women.length, kids.length);
    for (let i = 0; i < longest; i += 1) {
      if (women[i]) alternated.push(women[i]);
      if (kids[i]) alternated.push(kids[i]);
    }

    return [...head, ...alternated, ...others];
  }, [catalog, category, view]);

  const products = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const midTicker = !bannersEnabled;
  const headProducts = midTicker ? products.slice(0, MID_TICKER_AFTER) : products;
  const tailProducts = midTicker ? products.slice(MID_TICKER_AFTER) : [];

  function changeCategory(nextCategory: ProductCategory) {
    setCategory(nextCategory);
    setVisibleCount(PAGE_SIZE);
  }

  function changeView(nextView: ProductView) {
    setView(nextView);
    setCategory('ALL');
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <main className="min-h-screen">
      <Header />
      {bannersEnabled ? <HeroBanners banners={banners} /> : null}
      <ViewToggle value={view} onChange={changeView} />
      <CategoryNav categories={availableCategories} value={category} onChange={changeCategory} />
      {bannersEnabled ? <OffersBanner /> : null}
      <SearchOverlay products={filterProducts(catalog, 'ALL', view)} />
      {midTicker ? (
        <>
          <ProductGrid products={headProducts} className="pb-3" />
          <OffersBanner />
          {tailProducts.length ? <ProductGrid products={tailProducts} className="pt-3" /> : null}
        </>
      ) : (
        <ProductGrid products={products} />
      )}
      {filtered.length ? (
        <div className="px-4 pb-6">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
              className="w-full border border-[#4f8f6e] bg-[#4f8f6e] px-5 py-4 text-[11px] font-semibold tracking-[0.22em] text-[#faf8f3]"
            >
              LOAD MORE · കൂടുതൽ
            </button>
          ) : (
            <p className="w-full border border-hairline px-5 py-4 text-center font-ml text-[12px] font-semibold tracking-[0.08em] text-muted">
              അടീക്ക് ഇനിയും scroll
            </p>
          )}
        </div>
      ) : null}
      <section className="border-t border-hairline px-4 pb-12 pt-8">
        <a
          href={waUrl(`Hi, ഓടേ ന്റെ സാനം — ${BRAND.domain}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#25D366] bg-[#25D366] px-5 py-4 text-center text-white"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-ml text-[18px] font-semibold leading-tight">ഓടേ ന്റെ സാനം</span>
        </a>
        <p className="mx-auto max-w-[340px] border border-[#4f8f6e]/10 bg-white/80 px-4 py-2.5 text-center text-[11px] leading-5 text-muted">
          Hidden coupon codes on the site — find one, message us, and unlock up to{' '}
          <span className="font-semibold text-[#3d6b58]">50% off</span> or{' '}
          <span className="font-semibold text-[#3d6b58]">free shipping</span>.
        </p>
      </section>
    </main>
  );
}
