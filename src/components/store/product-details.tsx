'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Header } from '@/components/store/header';
import { ProductCard } from '@/components/store/product-card';
import { ProductPrice } from '@/components/store/product-price';
import { useWhatsappUrl } from '@/components/providers';
import { BRAND } from '@/lib/brand';
import { categoryLabel, type StoreProduct } from '@/lib/products';
import { useCart } from '@/lib/store';
import { cn, formatPrice } from '@/lib/utils';

type ProductDetailsProps = {
  product: StoreProduct;
  related: StoreProduct[];
};

export function ProductDetails({ product, related }: ProductDetailsProps) {
  const waUrl = useWhatsappUrl();
  const addItem = useCart((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  const gallery = useMemo(
    () => (product.images.length ? product.images : []),
    [product.images],
  );
  const unitPrice = product.salePrice ?? product.price;
  const requiresSize = product.sizes.length > 0;
  const requiresColor = product.colors.length > 0;

  return (
    <main className="min-h-screen">
      <Header />
      <div className="grid grid-cols-2 gap-1 p-1">
        {gallery.slice(0, 15).map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${product.name} gallery image ${index + 1}`}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            className="aspect-[3/4] rounded-2xl bg-surface object-cover"
          />
        ))}
      </div>

      <section className="px-4 py-7">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-muted">
          {product.line === 'KIDS'
            ? '🧒 കുട്ട്യേൾക്ക്'
            : product.line === 'MEN'
              ? '💙 ഓന്'
              : '🌸 ഓൾക്ക്'}{' '}
          · {categoryLabel(product.category)}
        </p>
        <h1 className="font-serif text-5xl leading-[0.92] tracking-[-0.06em] text-[#3d6b58]">
          {product.name}
        </h1>
        <ProductPrice
          className="mt-4"
          price={product.price}
          salePrice={product.salePrice}
          size="lg"
        />
        {product.description ? (
          <p className="mt-5 text-sm leading-6 text-muted">{product.description}</p>
        ) : null}
      </section>

      {requiresSize ? (
        <section className="border-y border-hairline px-4 py-5">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.22em]">SIZE</p>
          <div className="grid grid-cols-5 gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'border px-2 py-3 text-xs font-medium',
                  selectedSize === size
                    ? 'border-[#4f8f6e] bg-[#4f8f6e] text-[#faf8f3]'
                    : 'border-hairline',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {requiresColor ? (
        <section
          className={cn(
            'border-hairline px-4 py-5',
            requiresSize ? 'border-b' : 'border-y',
          )}
        >
          <p className="mb-3 text-[11px] font-semibold tracking-[0.22em]">COLOR</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'border px-2 py-3 text-xs font-medium',
                  selectedColor === color
                    ? 'border-[#4f8f6e] bg-[#4f8f6e] text-[#faf8f3]'
                    : 'border-hairline',
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className={cn(
          'px-4 py-5',
          requiresSize || requiresColor ? '' : 'border-t border-hairline',
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.22em]">QUANTITY</p>
          <div className="flex items-center border border-hairline">
            <button type="button" className="size-10" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
              -
            </button>
            <span className="min-w-10 text-center text-sm">{quantity}</span>
            <button type="button" className="size-10" onClick={() => setQuantity((value) => value + 1)}>
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          disabled={(requiresSize && !selectedSize) || (requiresColor && !selectedColor)}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: unitPrice,
              imageUrl: product.images[0],
              size: selectedSize || undefined,
              color: selectedColor || undefined,
              quantity,
            })
          }
          className="w-full bg-[#4f8f6e] px-5 py-4 text-[11px] font-semibold tracking-[0.22em] text-white disabled:opacity-50"
        >
          BUY NOW · {formatPrice(unitPrice)}
        </button>
        <a
          href={waUrl(`Hi, I have a question about ${product.name} on ${BRAND.domain}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center border border-[#25D366] bg-[#25D366] px-5 py-4 text-center text-[11px] font-semibold tracking-[0.14em] text-white"
        >
          Questions? WhatsApp us · ചോദ്യങ്ങളുണ്ടോ?
        </a>
      </section>

      <section className="border-t border-hairline px-4 py-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-3xl tracking-[-0.05em]">Related</h2>
          <Link href="/" className="text-[10px] font-semibold tracking-[0.18em] text-muted">
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
