import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import {
  createProductFromFormData,
  formatProductSaveError,
} from '@/lib/admin-product-save';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized — sign in again at /manage/login' },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const product = await createProductFromFormData(formData);
    return NextResponse.json({
      ok: true,
      id: product.id,
      slug: product.slug,
      redirectTo: '/manage/products',
    });
  } catch (error) {
    console.error('POST /api/manage/products failed', error);
    return NextResponse.json({ error: formatProductSaveError(error) }, { status: 400 });
  }
}
