'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImageCropDialog } from '@/components/admin/image-crop-dialog';
import { compressImageForUpload } from '@/lib/compress-image';
import { cn } from '@/lib/utils';

export type GalleryItem = {
  key: string;
  url: string;
  file: File | null;
  preview: string;
};

type ProductImageGalleryProps = {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  max?: number;
};

const MAX_PICK_BYTES = 12 * 1024 * 1024;
const PRODUCT_ASPECT = 4 / 5;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp)$/i;

function makeKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isImageFile(file: File) {
  if (file.type.startsWith('image/')) return true;
  // Windows Explorer drag-drop often sends empty MIME — fall back to extension
  return IMAGE_EXT.test(file.name);
}

export function createGalleryItem(input: { url?: string; file?: File | null; preview?: string }): GalleryItem {
  const file = input.file ?? null;
  const preview = input.preview || input.url || (file ? URL.createObjectURL(file) : '');
  return {
    key: makeKey(),
    url: input.url || '',
    file,
    preview,
  };
}

export function ProductImageGallery({ items, onChange, max = 15 }: ProductImageGalleryProps) {
  const bulkId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [cropping, setCropping] = useState<GalleryItem | null>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  function setItems(next: GalleryItem[]) {
    onChange(next.slice(0, max));
  }

  async function addFiles(fileList: FileList | File[]) {
    const all = Array.from(fileList);
    const incoming = all.filter(isImageFile);
    if (!incoming.length) {
      setError(
        all.length
          ? 'Those files are not supported images. Use JPG, PNG, or WebP.'
          : 'No files received. Try Choose multiple photos instead.',
      );
      return;
    }

    const current = itemsRef.current;
    const room = max - current.length;
    if (room <= 0) {
      setError(`You already have ${max} images.`);
      return;
    }

    const slice = incoming.slice(0, room);
    setPreparing(true);
    setError(
      incoming.length > room
        ? `Only ${room} more image${room === 1 ? '' : 's'} can be added (max ${max}).`
        : '',
    );

    try {
      const accepted: GalleryItem[] = [];
      for (const file of slice) {
        if (file.size > MAX_PICK_BYTES) {
          setError(`${file.name} is larger than 12MB.`);
          continue;
        }
        // Compress locally only — upload happens when you Create/Save
        const crushed = await compressImageForUpload(file);
        const preview = URL.createObjectURL(crushed);
        accepted.push(createGalleryItem({ file: crushed, preview }));
      }

      if (accepted.length) {
        setItems([...itemsRef.current, ...accepted]);
        if (incoming.length <= room) setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare photos.');
    } finally {
      setPreparing(false);
    }
  }

  function handleBulk(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) void addFiles(event.target.files);
    event.target.value = '';
  }

  function onDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setDragging(false);
    const files = event.dataTransfer?.files;
    if (files?.length) {
      void addFiles(files);
      return;
    }
    setError('Drop failed. Click this box or use Choose multiple photos.');
  }

  function removeAt(index: number) {
    const target = items[index];
    if (target?.preview.startsWith('blob:')) URL.revokeObjectURL(target.preview);
    setItems(items.filter((_, i) => i !== index));
    setError('');
  }

  function makeCover(index: number) {
    if (index <= 0) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    setItems(next);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setItems(next);
  }

  async function finishCrop(file: File) {
    if (!cropping) return;
    const key = cropping.key;
    setCropping(null);
    setPreparing(true);
    try {
      const crushed = await compressImageForUpload(file);
      const preview = URL.createObjectURL(crushed);
      const cropped = createGalleryItem({ file: crushed, preview });
      setItems(
        items.map((item) => {
          if (item.key !== key) return item;
          if (item.preview.startsWith('blob:') && item.preview !== preview) {
            URL.revokeObjectURL(item.preview);
          }
          return cropped;
        }),
      );
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop failed.');
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={bulkId}
          className={cn(
            'cursor-pointer bg-black px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-white',
            preparing && 'pointer-events-none opacity-60',
          )}
        >
          {preparing ? 'OPTIMIZING…' : 'CHOOSE MULTIPLE PHOTOS'}
        </label>
        <input
          ref={inputRef}
          id={bulkId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif"
          multiple
          disabled={preparing}
          onChange={handleBulk}
          className="sr-only"
        />
        <p className="text-sm text-black/55">
          {items.length}/{max} · first = cover · photos ready instantly, upload on Create
        </p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!preparing) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!preparing) inputRef.current?.click();
          }
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'cursor-pointer border border-dashed px-4 py-10 text-center transition outline-none focus-visible:border-black',
          dragging ? 'border-black bg-neutral-100' : 'border-black/20 bg-neutral-50',
          preparing && 'pointer-events-none opacity-60',
        )}
      >
        <p className="text-sm font-medium text-black">
          {dragging ? 'Drop photos here' : 'Drop photos here, or click to choose'}
        </p>
        <p className="mt-1 text-xs text-black/55">JPG, PNG, or WebP · up to {max} images</p>
      </div>

      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, index) => (
            <div key={item.key} className="overflow-hidden border border-black/15 bg-white">
              <div className="relative aspect-[4/5] bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview || item.url}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-white">
                    COVER
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 border-t border-black/10 p-3">
                <button
                  type="button"
                  onClick={() => setCropping(item)}
                  disabled={preparing}
                  className="w-full bg-black px-3 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-white disabled:opacity-50"
                >
                  EDIT · CROP
                </button>
                <p className="truncate text-xs text-black/55">
                  {item.url ? 'Saved' : item.file?.name || `Image ${index + 1}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeCover(index)}
                      className="border border-black px-2 py-1 text-[10px] font-semibold tracking-[0.12em]"
                    >
                      MAKE COVER
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="border border-black/15 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="border border-black/15 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="border border-red-600 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-red-700"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {cropping ? (
        <ImageCropDialog
          open
          imageSrc={cropping.preview || cropping.url}
          fileName={cropping.file?.name || 'product.jpg'}
          aspect={PRODUCT_ASPECT}
          title="Crop product photo"
          hint="Frame the product — 4:5 matches the shop cards."
          onCancel={() => setCropping(null)}
          onComplete={(file) => {
            void finishCrop(file);
          }}
        />
      ) : null}
    </div>
  );
}
