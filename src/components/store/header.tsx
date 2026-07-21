'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { BrandLogo } from '@/components/store/brand-logo';
import { useSearchUi } from '@/lib/search-ui';
import { useCart } from '@/lib/store';

const navLabelClass =
  'text-[14px] font-bold tracking-[0.14em] text-[#2f5a48]';

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
    <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-[#faf8f3]/92 px-4 py-2 backdrop-blur-md">
      <button
        type="button"
        onClick={openCart}
        className={`text-left ${navLabelClass}`}
        aria-label="Open cart"
      >
        CART ({mounted ? count : 0})
      </button>
      <BrandLogo size="sm" showMalayalam={false} className="py-0.5" />
      <div className="flex items-center justify-end gap-2">
        {showSearch ? (
          <button
            type="button"
            onClick={openSearch}
            className="grid size-9 place-items-center text-[#2f5a48]"
            aria-label="Search"
          >
            <Search className="size-[18px]" strokeWidth={2.25} />
          </button>
        ) : null}
        <Link href="/checkout" className={navLabelClass}>
          CHECKOUT
        </Link>
      </div>
    </header>
  );
}
