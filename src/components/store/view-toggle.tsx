'use client';

import { motion } from 'framer-motion';
import { type ProductView, VIEW_LABELS, VIEWS } from '@/lib/products';
import { cn } from '@/lib/utils';

type ViewToggleProps = {
  value: ProductView;
  onChange: (view: ProductView) => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="px-4 pb-0.5 pt-1">
      <div className="relative grid w-full grid-cols-2 overflow-hidden rounded-full border border-[#e2b13c]/50 bg-white">
        {VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => onChange(view)}
            className={cn(
              'relative z-10 rounded-full px-3 py-1 text-[9px] font-bold tracking-[0.12em] transition',
              value === view ? 'text-white' : 'text-[#8a6a14]',
            )}
          >
            {VIEW_LABELS[view]}
            {value === view ? (
              <motion.span
                layoutId="view-toggle-indicator"
                className="absolute inset-[2px] -z-10 rounded-full bg-[#e2b13c]"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            ) : null}
          </button>
        ))}
      </div>
      {value === 'GIFTS' ? (
        <p className="mt-0.5 text-center font-ml text-[8px] font-bold tracking-[0.08em] text-[#8a6a14]">
          Thoughtful gifts · ചിന്തിച്ച സമ്മാനങ്ങൾ
        </p>
      ) : null}
    </div>
  );
}
