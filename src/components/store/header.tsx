'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { BrandLogo } from '@/components/store/brand-logo';
import { useSearchUi } from '@/lib/search-ui';
import { useCart } from '@/lib/store';

const navLabelClass =
  'text-[10px] font-bold tracking-[0.12em] text-[#2f5a48] sm:text-[11px]';

export function Header() {
  const pathname = usePathname() ?? '';
  const openCart = useCart((state) => state.open);
  const openSearch = useSearchUi((state) => state.open);
  const count = useCart((state) => state.count());
  const [mounted, setMounted] = useState(false);
  const showSearch = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 border-b border-hairline bg-[#faf8f3]/92 px-2.5 py-1.5 backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2">
      <button
        type="button"
        onClick={openCart}
        className={`min-w-0 justify-self-start truncate text-left ${navLabelClass}`}
        aria-label="Open cart"
      >
        CART ({mounted ? count : 0})
      </button>
      <BrandLogo size="sm" showMalayalam={false} className="py-0" />
      <div className="flex items-center justify-end gap-1 sm:gap-1.5">
        {showSearch ? (
          <button
            type="button"
            onClick={openSearch}
            className="grid size-7 place-items-center text-[#2f5a48] sm:size-8"
            aria-label="Search"
          >
            <Search className="size-[14px] sm:size-[15px]" strokeWidth={2.25} />
          </button>
        ) : null}
        <Link href="/checkout" className={`truncate ${navLabelClass}`}>
          CHECKOUT
        </Link>
      </div>
    </header>
  );
}
