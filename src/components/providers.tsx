'use client';

import type { ReactNode } from 'react';
import { createContext, Suspense, useContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { CartDrawer } from '@/components/store/cart-drawer';
import { PageViewTracker } from '@/components/store/page-view-tracker';
import { SiteShell } from '@/components/store/site-shell';
import { WhatsAppOrderButton } from '@/components/store/whatsapp-order-button';
import { BRAND, whatsappUrl } from '@/lib/brand';

const WhatsappNumberContext = createContext<string>(BRAND.whatsapp);

/** Builds wa.me links with the admin-configured number (falls back to brand default). */
export function useWhatsappUrl() {
  const number = useContext(WhatsappNumberContext);
  return (message: string) => whatsappUrl(message, number);
}

type ProvidersProps = {
  children: ReactNode;
  whatsappNumber?: string;
};

export function Providers({ children, whatsappNumber }: ProvidersProps) {
  const pathname = usePathname() ?? '';
  const isAdmin = pathname.startsWith('/manage');
  const number = whatsappNumber || BRAND.whatsapp;

  if (isAdmin) {
    return (
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    );
  }

  return (
    <WhatsappNumberContext.Provider value={number}>
      <SiteShell>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        {children}
        <CartDrawer />
        {pathname === '/' ? <WhatsAppOrderButton /> : null}
      </SiteShell>
    </WhatsappNumberContext.Provider>
  );
}
