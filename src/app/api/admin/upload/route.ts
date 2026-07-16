import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { saveUploadedImage } from '@/lib/uploads';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized — sign in again at /manage/login' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // After client compress, files should be tiny. Hard-cap protects Postgres.
    if (file.size > 900_000) {
      return NextResponse.json(
        {
          error: `Photo is still too large (${Math.round(file.size / 1024)}KB). Compress failed — try another image.`,
        },
        { status: 400 },
      );
    }

    const url = await saveUploadedImage(file);
    if (!url) {
      return NextResponse.json({ error: 'Upload failed.' }, { status: 400 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('upload failed', error);
    const message = error instanceof Error ? error.message : 'Upload failed.';
    const friendly =
      /timeout|terminat|ECONN|ETIMEDOUT|too large|bytes/i.test(message)
        ? 'Photo upload timed out or was too large. Try one smaller photo.'
        : message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }
}
