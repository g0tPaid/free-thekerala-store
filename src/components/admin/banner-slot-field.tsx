'use client';

import { useRef, useState, useTransition } from 'react';
import { saveBannerSlot } from '@/app/manage/actions/settings';

type BannerSlotFieldProps = {
  index: 1 | 2 | 3;
  defaultUrl?: string | null;
  defaultLink?: string | null;
};

function uploadWithProgress(file: File, onProgress: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);

    xhr.open('POST', '/api/admin/upload');
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      // Reserve 0–90% for upload bytes; 90–100% for saving URL
      onProgress(Math.min(90, Math.round((event.loaded / event.total) * 90)));
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
    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.send(body);
  });
}

export function BannerSlotField({ index, defaultUrl, defaultLink }: BannerSlotFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const busy = progress !== null || pending;

  async function persistUrl(nextUrl: string) {
    startTransition(async () => {
      try {
        setPhase('Saving to store…');
        setProgress(95);
        await saveBannerSlot(index, nextUrl);
        setProgress(100);
        setPhase('Saved');
        setSaved(true);
        window.setTimeout(() => {
          setSaved(false);
          setProgress(null);
          setPhase('');
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save banner.');
        setProgress(null);
        setPhase('');
      }
    });
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setError('');
    setSaved(false);
    setProgress(0);
    setPhase('Uploading…');
    try {
      const nextUrl = await uploadWithProgress(file, (pct) => {
        setProgress(pct);
        setPhase(`Uploading… ${pct}%`);
      });
      setUrl(nextUrl);
      if (inputRef.current) inputRef.current.value = nextUrl;
      setProgress(92);
      setPhase('Saving to store…');
      await persistUrl(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(null);
      setPhase('');
    }
  }

  return (
    <div className="space-y-3 border border-black/10 bg-[#faf8f3] p-4 md:col-span-2">
      <p className="text-sm font-semibold tracking-[0.08em] text-[#4f8f6e]">BANNER {index}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={`Banner ${index} preview`}
          className="aspect-[12/5] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[12/5] items-center justify-center border border-dashed border-black/20 text-sm text-black/45">
          No image yet
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor={`banner${index}Url`}>
            Image URL
          </label>
          <input
            ref={inputRef}
            id={`banner${index}Url`}
            name={`banner${index}Url`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (next && next !== (defaultUrl ?? '').trim()) {
                void persistUrl(next);
              }
            }}
            placeholder="/api/media/f/… or https://…"
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor={`banner${index}Link`}>
            Optional link
          </label>
          <input
            id={`banner${index}Link`}
            name={`banner${index}Link`}
            type="text"
            defaultValue={defaultLink ?? ''}
            placeholder="https://… or /product/…"
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>
      </div>

      {progress !== null ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-black/60">
            <span>{phase || 'Working…'}</span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[#4f8f6e] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`cursor-pointer px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white ${
            busy ? 'bg-[#4f8f6e]/70' : 'bg-[#4f8f6e]'
          }`}
        >
          {busy ? `${progress ?? 0}%` : 'UPLOAD IMAGE'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              void onFile(event.target.files?.[0] ?? null);
              event.target.value = '';
            }}
          />
        </label>
        {saved ? (
          <p className="text-xs font-medium text-[#4f8f6e]">Saved — live on homepage now.</p>
        ) : !busy ? (
          <p className="text-xs text-black/50">
            Exact size: <span className="font-medium text-black">1200 × 500 px</span> (12:5). Uploads
            save immediately.
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
