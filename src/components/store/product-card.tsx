'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { StoreProduct } from '@/lib/products';
import { ProductPrice } from '@/components/store/product-price';
import { useWishlist } from '@/lib/store';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: StoreProduct & { image?: string };
  /** Show diagonal COD ribbon. Default true for most products. */
  showCodBanner?: boolean;
};

export function ProductCard({ product, showCodBanner = true }: ProductCardProps) {
  const toggle = useWishlist((state) => state.toggle);
  const liked = useWishlist((state) => state.has(product.id));
  const image = product.image || product.images[0];

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
        <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={`View ${product.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        {showCodBanner ? (
          <div
            className="pointer-events-none absolute -left-8 top-3 z-[1] w-[7.5rem] -rotate-45 bg-[#4f8f6e] py-[3px] text-center shadow-sm"
            aria-hidden
          >
            <span className="block text-[7px] font-bold uppercase leading-none tracking-[0.12em] text-[#faf8f3]">
              COD available
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => toggle(product.id)}
          className="absolute right-1.5 top-1.5 z-[2] grid size-7 place-items-center rounded-full bg-white/85 text-black backdrop-blur"
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={liked}
        >
          <Heart className={cn('size-3.5', liked && 'fill-black')} strokeWidth={1.7} />
        </button>
      </div>
      <Link href={`/product/${product.slug}`} className="mt-1.5 block">
        <h3 className="truncate text-[11px] font-medium leading-tight uppercase tracking-[0.12em]">{product.name}</h3>
        <ProductPrice
          className="mt-0.5"
          price={product.price}
          salePrice={product.salePrice}
          size="sm"
        />
      </Link>
    </article>
  );
}
