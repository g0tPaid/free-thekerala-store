/** Browser-side crush before upload — Postgres BYTEA writes are the slow part. */

async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  baseName: string,
  quality = 0.55,
): Promise<File | null> {
  let q = quality;
  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', q));
    if (!blob) break;
    // Keep uploads tiny so Railway Postgres BYTEA inserts don't time out
    if (blob.size <= 120_000 || q <= 0.35) break;
    q -= 0.05;
  }
  if (!blob) return null;
  const name = baseName.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

export async function compressImageForUpload(
  file: File,
  maxEdge = 900,
  quality = 0.55,
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

export function uploadImageFile(file: File, onProgress?: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);

    xhr.open('POST', '/api/admin/upload');
    xhr.timeout = 60_000;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || '{}') as { url?: string; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && payload.url) {
          resolve(payload.url);
          return;
        }
        reject(new Error(payload.error || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.ontimeout = () =>
      reject(new Error('Upload timed out. Use a smaller photo (under 1MB after compress).'));
    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.send(body);
  });
}
