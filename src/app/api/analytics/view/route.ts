import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: string; sessionId?: string };
    const path = typeof body.path === 'string' ? body.path.trim().slice(0, 300) : '';
    const sessionId =
      typeof body.sessionId === 'string' ? body.sessionId.trim().slice(0, 80) : null;

    if (!path || path.startsWith('/manage') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.pageView.create({
      data: {
        path,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.warn('page view track failed', error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
