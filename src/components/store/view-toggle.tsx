'use client';

import Image from 'next/image';
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
    active: 'bg-[#f9c5d1]',
    idle: 'bg-[#fce7ec]',
    border: 'border-[#f9a8d4]',
    mark: '🌸',
    label: 'WOMEN',
  },
  KIDS: {
    active: 'bg-gradient-to-r from-[#ec4899] to-[#3b82f6] text-white',
    idle: 'bg-transparent text-[#7c3aed]',
    border: 'border-[#c4b5fd]',
    mark: '🧒',
    label: 'KIDS',
  },
  MEN: {
    active: 'bg-[#2563eb] text-white',
    idle: 'bg-transparent text-[#1d4ed8]',
    border: 'border-[#93c5fd]',
    mark: '💙',
    label: 'MEN',
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
          const isWomen = view === 'WOMEN';

          return (
            <button
              key={view}
              type="button"
              aria-label={isWomen ? 'Women' : styles.label}
              onClick={() => onChange(selected ? 'ALL' : view)}
              className={cn(
                'relative z-10 flex h-10 items-center justify-center overflow-hidden rounded-full px-1.5 transition',
                !isWomen && selected && styles.active,
                !isWomen && !selected && styles.idle,
                isWomen && (selected ? 'ring-2 ring-[#ec4899] ring-inset' : 'opacity-90'),
              )}
            >
              {isWomen ? (
                <Image
                  src="/labels/women-pill.png"
                  alt=""
                  width={320}
                  height={80}
                  priority
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <>
                  <span className="text-[11px] leading-none" aria-hidden>
                    {styles.mark}
                  </span>
                  <span className="audience-label text-[12px] leading-none">{styles.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
