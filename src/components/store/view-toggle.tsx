'use client';

import { AUDIENCE_VIEWS, type AudienceView, type ProductView, VIEW_LABELS } from '@/lib/products';
import { cn } from '@/lib/utils';

type ViewToggleProps = {
  value: ProductView;
  onChange: (view: ProductView) => void;
};

const VIEW_STYLES: Record<
  AudienceView,
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
  const shellBorder =
    value === 'ALL' ? 'border-black/15' : VIEW_STYLES[value].border;

  return (
    <div className="px-2 pb-0.5 pt-1">
      <div
        className={cn(
          'relative grid w-full grid-cols-3 overflow-hidden rounded-full border bg-white',
          shellBorder,
        )}
      >
        {AUDIENCE_VIEWS.map((view) => {
          const styles = VIEW_STYLES[view];
          const selected = value === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => onChange(selected ? 'ALL' : view)}
              className={cn(
                'relative z-10 rounded-full px-1.5 py-1.5 font-ml text-[10px] font-bold leading-tight tracking-normal transition',
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
