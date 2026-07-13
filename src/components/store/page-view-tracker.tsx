'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SESSION_KEY = 'ks-analytics-sid';

function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function PageViewTracker() {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/manage')) return;

    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    const sessionId = getSessionId();

    const controller = new AbortController();
    void fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, sessionId }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // ignore analytics failures
    });

    return () => controller.abort();
  }, [pathname, searchParams]);

  return null;
}
