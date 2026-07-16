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

const DELAY_CLASS = ['audience-delay-0', 'audience-delay-1', 'audience-delay-2'] as const;

function WalkingElephant() {
  return (
    <span className="audience-pill-elephant" aria-hidden>
      <span className="audience-pill-elephant__walker">
        <svg
          className="audience-pill-elephant__bob"
          viewBox="0 0 44 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* body */}
          <ellipse cx="22" cy="18" rx="12" ry="8.5" />
          {/* head */}
          <circle cx="33" cy="14" r="6.2" />
          {/* ear */}
          <ellipse cx="30.5" cy="12.5" rx="4.2" ry="5.2" opacity="0.85" />
          {/* trunk */}
          <path d="M37.5 15c2.2 1.2 3.8 3.4 3.2 6.2-.3 1.4-1.4 2.2-2.4 1.6-.7-.4-.6-1.3-.3-2 .6-1.4.2-2.8-1.2-3.6l.7-2.2z" />
          {/* eye */}
          <circle cx="35.2" cy="12.8" r="1.05" fill="#faf8f3" />
          <circle cx="35.5" cy="12.9" r="0.45" fill="#1f3d32" />
          {/* legs */}
          <rect x="13.5" y="23" width="3.2" height="6.5" rx="1.4" />
          <rect x="18.2" y="23.5" width="3.2" height="6" rx="1.4" />
          <rect x="23.2" y="23" width="3.2" height="6.5" rx="1.4" />
          <rect x="27.8" y="23.5" width="3.2" height="6" rx="1.4" />
          {/* tail */}
          <path
            d="M10.5 16c-2.2-.2-3.8 1.2-4.2 2.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}

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
        <span className="audience-pill-sheen" aria-hidden />
        <WalkingElephant />
        {AUDIENCE_VIEWS.map((view, index) => {
          const styles = VIEW_STYLES[view];
          const selected = value === view;
          const delay = DELAY_CLASS[index] ?? DELAY_CLASS[0];
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
              <span className={cn('audience-mark-pulse text-[11px] leading-none', delay)} aria-hidden>
                {styles.mark}
              </span>
              <span
                className={cn(
                  'audience-label-script audience-label-pulse text-[15px] leading-none',
                  delay,
                )}
              >
                {styles.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
