'use client';

import { AUDIENCE_VIEWS, type AudienceView, type ProductView } from '@/lib/products';
import { cn } from '@/lib/utils';

type ViewToggleProps = {
  value: ProductView;
  onChange: (view: ProductView) => void;
};

const VIEW_STYLES: Record<
  AudienceView,
  { active: string; idle: string; border: string; mark: string; label: string }
> = {
  WOMEN: {
    active: 'bg-[#ec4899] text-white',
    idle: 'bg-transparent text-[#be185d]',
    border: 'border-[#f9a8d4]',
    mark: '🌸',
    label: 'Women',
  },
  KIDS: {
    active: 'bg-gradient-to-r from-[#ec4899] to-[#3b82f6] text-white',
    idle: 'bg-transparent text-[#7c3aed]',
    border: 'border-[#c4b5fd]',
    mark: '🧒',
    label: 'Kids',
  },
  MEN: {
    active: 'bg-[#2563eb] text-white',
    idle: 'bg-transparent text-[#1d4ed8]',
    border: 'border-[#93c5fd]',
    mark: '💙',
    label: 'Men',
  },
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const shellBorder = value === 'ALL' ? 'border-black/15' : VIEW_STYLES[value].border;

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
                'relative z-10 flex h-10 items-center justify-center gap-1 rounded-full px-1.5 transition',
                selected ? styles.active : styles.idle,
              )}
            >
              <span className="text-[11px] leading-none" aria-hidden>
                {styles.mark}
              </span>
              <span className="audience-label-script text-[15px] leading-none">{styles.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
