'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { CartDrawer } from '@/components/store/cart-drawer';
import { PageViewTracker } from '@/components/store/page-view-tracker';
import { SiteShell } from '@/components/store/site-shell';
import { WhatsAppOrderButton } from '@/components/store/whatsapp-order-button';

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.startsWith('/manage');

  if (isAdmin) {
    return (
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    );
  }

  return (
    <SiteShell>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
      <CartDrawer />
      {pathname === '/' ? <WhatsAppOrderButton /> : null}
    </SiteShell>
  );
}
