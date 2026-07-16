import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import {
  formatProductSaveError,
  updateProductFromFormData,
} from '@/lib/admin-product-save';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized — sign in again at /manage/login' },
      { status: 401 },
    );
  }

  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const product = await updateProductFromFormData(id, formData);
    return NextResponse.json({
      ok: true,
      id: product.id,
      slug: product.slug,
      redirectTo: '/manage/products',
    });
  } catch (error) {
    console.error('PATCH /api/manage/products/[id] failed', error);
    return NextResponse.json({ error: formatProductSaveError(error) }, { status: 400 });
  }
}
