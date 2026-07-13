'use client';

import { CATEGORIES, CATEGORY_LABELS, type ProductCategory } from '@/lib/products';
import { cn } from '@/lib/utils';

type CategoryNavProps = {
  value: ProductCategory;
  onChange: (category: ProductCategory) => void;
};

export function CategoryNav({ value, onChange }: CategoryNavProps) {
  return (
    <nav
      className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-1"
      aria-label="Product categories"
    >
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            'shrink-0 rounded-full border px-3 py-1 text-[9px] font-bold tracking-[0.12em] transition',
            value === category
              ? 'border-black bg-black text-white'
              : 'border-black/20 bg-white text-black hover:border-black',
          )}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </nav>
  );
}
