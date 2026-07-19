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

const SIZE = {
  sm: { px: 48, ml: 'text-[9px] tracking-[0.14em]' },
  md: { px: 150, ml: 'text-[11px] tracking-[0.16em]' },
  lg: { px: 260, ml: 'text-[13px] tracking-[0.18em]' },
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
    <span className={cn('inline-flex flex-col items-center gap-2.5', className)}>
      <span className={cn('relative inline-flex', size === 'lg' && 'brand-mark-in')}>
        <Image
          src="/logo-kerala-badge.png"
          alt="The Kerala Store"
          width={387}
          height={401}
          priority
          className="h-auto w-auto drop-shadow-[0_8px_28px_rgba(29,77,62,0.16)]"
          style={{ width: s.px, height: 'auto' }}
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
