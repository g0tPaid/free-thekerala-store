'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type MetricsPayload = {
  updatedAt: string;
  live: {
    activeNow: number;
    viewsLastHour: number;
    viewsToday: number;
    visitorsToday: number;
  };
  traffic: {
    views24h: number;
    viewsTotal: number;
    topPages: Array<{ path: string; views: number }>;
  };
  store: {
    productsActive: number;
    ordersTotal: number;
    ordersToday: number;
    pendingOrders: number;
    customers: number;
    revenueTotal: number;
    revenueToday: number;
  };
};

function money(value: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  label,
  value,
  hint,
  href,
  live,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  live?: boolean;
}) {
  const inner = (
    <div className="border border-blue-200 bg-white p-5 shadow-sm transition hover:border-blue-400">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-blue-400">{label}</p>
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-blue-700">{value}</p>
      {hint ? <p className="mt-2 text-xs text-blue-400">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function LiveMetrics({ currency = 'INR' }: { currency?: string }) {
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/manage/metrics', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load metrics');
      const data = (await response.json()) as MetricsPayload;
      setMetrics(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Metrics unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (loading && !metrics) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse border border-blue-100 bg-blue-50/50" />
        ))}
      </section>
    );
  }

  if (!metrics) {
    return <p className="text-sm text-red-600">{error || 'Metrics unavailable'}</p>;
  }

  const updated = new Date(metrics.updatedAt).toLocaleTimeString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Live metrics</p>
          <p className="mt-1 text-sm text-blue-500">Auto-refreshes every 8s · last update {updated}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-blue-300 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-700 hover:border-blue-500"
        >
          REFRESH
        </button>
      </div>

      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active now"
          value={metrics.live.activeNow.toLocaleString()}
          hint="Unique visitors · last 5 min"
          live
        />
        <StatCard
          label="Views today"
          value={metrics.live.viewsToday.toLocaleString()}
          hint={`${metrics.live.visitorsToday.toLocaleString()} unique visitors`}
          live
        />
        <StatCard
          label="Views · last hour"
          value={metrics.live.viewsLastHour.toLocaleString()}
          live
        />
        <StatCard
          label="Views · 24h"
          value={metrics.traffic.views24h.toLocaleString()}
          hint={`${metrics.traffic.viewsTotal.toLocaleString()} all-time`}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders today"
          value={metrics.store.ordersToday.toLocaleString()}
          hint={`${metrics.store.pendingOrders} pending`}
          href="/manage/orders"
        />
        <StatCard
          label="Revenue today"
          value={money(metrics.store.revenueToday, currency)}
          hint={`Total ${money(metrics.store.revenueTotal, currency)}`}
          href="/manage/orders"
        />
        <StatCard
          label="Active products"
          value={metrics.store.productsActive.toLocaleString()}
          href="/manage/products"
        />
        <StatCard
          label="Customers"
          value={metrics.store.customers.toLocaleString()}
          href="/manage/customers"
        />
      </section>

      <section className="border border-blue-200 bg-white">
        <div className="border-b border-blue-100 p-5">
          <h2 className="text-lg font-semibold text-blue-700">Top pages · last 24h</h2>
        </div>
        {metrics.traffic.topPages.length ? (
          <div className="divide-y divide-blue-100">
            {metrics.traffic.topPages.map((page) => (
              <div
                key={page.path}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm text-blue-800"
              >
                <span className="truncate font-medium">{page.path}</span>
                <span className="shrink-0 tabular-nums text-blue-500">{page.views} views</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-5 text-sm text-blue-400">
            No page views yet — open the storefront and browse; counts will appear here live.
          </p>
        )}
      </section>
    </div>
  );
}
