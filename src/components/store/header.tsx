'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/store/brand-logo';
import { useCart } from '@/lib/store';

export function Header() {
  const open = useCart((state) => state.open);
  const count = useCart((state) => state.count());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-[#faf8f3]/92 px-4 py-2.5 backdrop-blur-md">
      <button
        type="button"
        onClick={open}
        className="text-left text-[10px] font-bold tracking-[0.18em] text-[#2f5a48]"
        aria-label="Open cart"
      >
        CART ({mounted ? count : 0})
      </button>
      <BrandLogo size="sm" showMalayalam={false} className="py-0.5" />
      <Link
        href="/checkout"
        className="text-right text-[13px] font-bold tracking-[0.16em] text-[#2f5a48]"
      >
        CHECKOUT
      </Link>
    </header>
  );
}
