'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  href?: string | false;
  className?: string;
  showMalayalam?: boolean;
  as?: 'div' | 'h1';
};

/** Banner logo is wide. Widths tuned for header vs hero. */
const SIZE = {
  sm: { w: 196, h: 84, ml: 'text-[9px] tracking-[0.14em]' },
  md: { w: 360, h: 154, ml: 'text-[11px] tracking-[0.16em]' },
  lg: { w: 480, h: 206, ml: 'text-[13px] tracking-[0.18em]' },
} as const;

export function BrandLogo({
  size = 'md',
  href = '/',
  className,
  showMalayalam = true,
  as = 'div',
}: BrandLogoProps) {
  const s = SIZE[size];
  const TitleTag = as;

  const content = (
    <span className={cn('inline-flex flex-col items-center gap-2', className)}>
      <span className={cn('relative inline-flex', size === 'lg' && 'brand-mark-in')}>
        <Image
          src="/logo-kerala-banner.png"
          alt="The Kerala Store"
          width={s.w}
          height={s.h}
          priority
          className="h-auto max-h-14 w-auto object-contain sm:max-h-[3.75rem]"
          style={{ width: 'auto', maxWidth: s.w, height: 'auto' }}
        />
      </span>
      {as === 'h1' ? <TitleTag className="sr-only">The Kerala Store</TitleTag> : null}
      {showMalayalam ? (
        <span
          className={cn(
            'font-ml font-medium text-[#3d6b58]',
            s.ml,
            size === 'lg' && 'brand-sub-in',
          )}
        >
          കേരള സ്റ്റോർ
        </span>
      ) : null}
    </span>
  );

  if (href === false) return content;

  return (
    <Link href={href} className="inline-flex justify-center" aria-label="The Kerala Store home">
      {content}
    </Link>
  );
}
