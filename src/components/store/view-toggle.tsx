'use client';

import { type ProductView, VIEW_LABELS, VIEWS } from '@/lib/products';
import { cn } from '@/lib/utils';

type ViewToggleProps = {
  value: ProductView;
  onChange: (view: ProductView) => void;
};

const VIEW_STYLES: Record<
  ProductView,
  { active: string; idle: string; border: string }
> = {
  WOMEN: {
    active: 'bg-[#ec4899] text-white',
    idle: 'bg-transparent text-[#be185d]',
    border: 'border-[#f9a8d4]',
  },
  KIDS: {
    active: 'bg-gradient-to-r from-[#ec4899] to-[#3b82f6] text-white',
    idle: 'bg-transparent text-[#7c3aed]',
    border: 'border-[#c4b5fd]',
  },
  MEN: {
    active: 'bg-[#2563eb] text-white',
    idle: 'bg-transparent text-[#1d4ed8]',
    border: 'border-[#93c5fd]',
  },
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const shellBorder = VIEW_STYLES[value].border;

  return (
    <div className="px-4 pb-0.5 pt-1">
      <div
        className={cn(
          'relative grid w-full grid-cols-3 overflow-hidden rounded-full border bg-white',
          shellBorder,
        )}
      >
        {VIEWS.map((view) => {
          const styles = VIEW_STYLES[view];
          const selected = value === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => onChange(view)}
              className={cn(
                'relative z-10 rounded-full px-2 py-1.5 text-[9px] font-bold tracking-[0.08em] transition',
                selected ? styles.active : styles.idle,
              )}
            >
              {VIEW_LABELS[view]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
