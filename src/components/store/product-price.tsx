import { cn, formatPrice } from '@/lib/utils';

type ProductPriceProps = {
  price: number;
  salePrice?: number | null;
  className?: string;
  /** Slightly compact for cards / search */
  size?: 'sm' | 'lg';
};

/** Sale (green, left) + original (red, strikethrough) when on sale. */
export function ProductPrice({ price, salePrice, className, size = 'lg' }: ProductPriceProps) {
  const onSale =
    typeof salePrice === 'number' && Number.isFinite(salePrice) && salePrice > 0 && salePrice < price;

  if (!onSale) {
    return (
      <p
        className={cn(
          'font-semibold tracking-tight text-[#2f7a55]',
          size === 'lg' ? 'text-2xl' : 'text-[11px]',
          className,
        )}
      >
        {formatPrice(salePrice ?? price)}
      </p>
    );
  }

  return (
    <p
      className={cn(
        'flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5',
        size === 'sm' && 'justify-center',
        className,
      )}
    >
      <span
        className={cn(
          'font-semibold tracking-tight text-[#2f7a55]',
          size === 'lg' ? 'text-2xl' : 'text-sm',
        )}
      >
        {formatPrice(salePrice)}
      </span>
      <span
        className={cn(
          'font-medium text-red-600 line-through decoration-red-600/80',
          size === 'lg' ? 'text-base' : 'text-[10px]',
        )}
      >
        {formatPrice(price)}
      </span>
    </p>
  );
}
