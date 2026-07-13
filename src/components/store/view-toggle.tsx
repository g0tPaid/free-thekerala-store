'use client';

import { type ProductView, VIEW_LABELS, VIEWS } from '@/lib/products';
import { cn } from '@/lib/utils';

type ViewToggleProps = {
  value: ProductView;
  onChange: (view: ProductView) => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="px-4 pb-0 pt-0.5">
      <div className="relative grid h-6 w-full grid-cols-2 overflow-hidden rounded-full border border-[#e2b13c]/50 bg-white">
        {VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => onChange(view)}
            className={cn(
              'relative z-10 flex h-full items-center justify-center rounded-full px-2 text-[8px] font-bold leading-none tracking-[0.1em] transition',
              value === view
                ? 'bg-[#e2b13c] text-white'
                : 'bg-transparent text-[#8a6a14]',
            )}
          >
            {VIEW_LABELS[view]}
          </button>
        ))}
      </div>
      {value === 'GIFTS' ? (
        <p className="mt-0.5 text-center font-ml text-[7px] font-bold leading-none tracking-[0.06em] text-[#8a6a14]">
          Thoughtful gifts · ചിന്തിച്ച സമ്മാനങ്ങൾ
        </p>
      ) : null}
    </div>
  );
}
