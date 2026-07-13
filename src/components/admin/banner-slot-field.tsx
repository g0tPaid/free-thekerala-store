'use client';

import { useRef, useState, useTransition } from 'react';
import { saveBannerSlot } from '@/app/manage/actions/settings';

type BannerSlotFieldProps = {
  index: 1 | 2 | 3;
  defaultUrl?: string | null;
  defaultLink?: string | null;
};

export function BannerSlotField({ index, defaultUrl, defaultLink }: BannerSlotFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  async function persistUrl(nextUrl: string) {
    startTransition(async () => {
      try {
        await saveBannerSlot(index, nextUrl);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save banner.');
      }
    });
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError('');
    setSaved(false);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Upload failed');
      }
      setUrl(payload.url);
      if (inputRef.current) inputRef.current.value = payload.url;
      await persistUrl(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
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
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer bg-[#4f8f6e] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white">
          {uploading || pending ? 'SAVING…' : 'UPLOAD IMAGE'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading || pending}
            onChange={(event) => {
              void onFile(event.target.files?.[0] ?? null);
              event.target.value = '';
            }}
          />
        </label>
        {saved ? (
          <p className="text-xs font-medium text-[#4f8f6e]">Saved — live on homepage now.</p>
        ) : (
          <p className="text-xs text-black/50">
            Exact size: <span className="font-medium text-black">1200 × 500 px</span> (12:5). Uploads
            save immediately.
          </p>
        )}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
