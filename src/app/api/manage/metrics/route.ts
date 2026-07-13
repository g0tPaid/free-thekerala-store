import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    viewsToday,
    viewsLastHour,
    viewsTotal,
    viewsDayAgo,
    liveSessions,
    sessionsToday,
    productCount,
    orderCount,
    ordersToday,
    pendingOrders,
    customerCount,
    revenueAll,
    revenueToday,
    topPathsRaw,
  ] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: hourAgo } } }),
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: fiveMinAgo }, sessionId: { not: null } },
      select: { sessionId: true },
      distinct: ['sessionId'],
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: todayStart }, sessionId: { not: null } },
      select: { sessionId: true },
      distinct: ['sessionId'],
    }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: dayAgo } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    updatedAt: now.toISOString(),
    live: {
      activeNow: liveSessions.length,
      viewsLastHour,
      viewsToday,
      visitorsToday: sessionsToday.length,
    },
    traffic: {
      views24h: viewsDayAgo,
      viewsTotal,
      topPages: topPathsRaw.map((row) => ({
        path: row.path,
        views: row._count.path,
      })),
    },
    store: {
      productsActive: productCount,
      ordersTotal: orderCount,
      ordersToday,
      pendingOrders,
      customers: customerCount,
      revenueTotal: Number(revenueAll._sum.total ?? 0),
      revenueToday: Number(revenueToday._sum.total ?? 0),
    },
  });
}
