/** Browser-side crush before upload — Postgres BYTEA writes are the slow part. */

async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  baseName: string,
  quality = 0.62,
): Promise<File | null> {
  let q = quality;
  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', q));
    if (!blob) break;
    if (blob.size <= 180_000 || q <= 0.45) break;
    q -= 0.08;
  }
  if (!blob) return null;
  const name = baseName.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

export async function compressImageForUpload(
  file: File,
  maxEdge = 1000,
  quality = 0.62,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const next = await canvasToJpegFile(canvas, file.name, quality);
    return next ?? file;
  } catch {
    return file;
  }
}
