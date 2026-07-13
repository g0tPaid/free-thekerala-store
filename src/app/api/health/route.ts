import { NextResponse } from 'next/server';

/** Lightweight probe for Railway / uptime checks — no DB. */
export async function GET() {
  return NextResponse.json({ ok: true, service: 'free-thekerala-store' });
}
