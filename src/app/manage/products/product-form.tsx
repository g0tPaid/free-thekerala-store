'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  createGalleryItem,
  ProductImageGallery,
  type GalleryItem,
} from '@/components/admin/product-image-gallery';
import { uploadImageFile } from '@/lib/compress-image';
import { cn } from '@/lib/utils';

type CategoryOption = {
  id: string;
  name: string;
  parentName?: string | null;
  isVisible?: boolean;
};

type ProductForForm = {
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  brand: string | null;
  price: unknown;
  salePrice: unknown | null;
  sku: string | null;
  stock: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  weight: number | null;
  material: string | null;
  status: string;
  featured: boolean;
  newArrival: boolean;
  homepageOrder: number | null;
  categoryId: string | null;
  media: Array<{
    url: string;
    kind: string;
    sortOrder?: number;
  }>;
};

type ProductFormProps = {
  productId?: string;
  categories: CategoryOption[];
  product?: ProductForForm | null;
  submitLabel: string;
};

const statuses = ['DRAFT', 'ACTIVE', 'ARCHIVED', 'HIDDEN'];
const IMAGE_SLOTS = 15;
const CLOTHES_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'XXXXXL'] as const;
const KIDS_YEAR_SIZES = [
  '1 year',
  '2 year',
  '3 year',
  '4 year',
  '5 year',
  '6 year',
  '7 year',
  '8 year',
  '9 year',
  '10 year',
  '11 year',
  '12 year',
] as const;
const SHOE_EU = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] as const;
const SHOE_UK = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
const SHOE_US = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13'] as const;

type SizeMode = 'clothes' | 'kids' | 'shoes' | 'custom' | 'none';

function fieldValue(value: unknown) {
  return value === null || value === undefined ? '' : String(value);
}

function normalizeKidsYearLabel(size: string) {
  const trimmed = size.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})\s*(year|years|yr|yrs|y)$/);
  if (!match) return null;
  const age = Number(match[1]);
  if (age < 1 || age > 12) return null;
  return `${age} year`;
}

function guessSizeMode(sizes: string[]): SizeMode {
  if (!sizes.length) return 'none';

  const joined = sizes.join(' ').toUpperCase();
  if (joined.includes('EU ') || joined.includes('UK ') || joined.includes('US ')) {
    return 'shoes';
  }

  const kidsNormalized = sizes.map((size) => normalizeKidsYearLabel(size));
  if (kidsNormalized.length && kidsNormalized.every(Boolean)) {
    return 'kids';
  }

  const normalized = sizes.map((size) => size.trim().toUpperCase());
  const clothesSet = new Set<string>(CLOTHES_SIZES);
  if (normalized.every((size) => clothesSet.has(size))) {
    return 'clothes';
  }

  return 'custom';
}

function parseSelectedSizes(sizes: string[], mode: SizeMode) {
  if (mode === 'none') return [];
  if (mode === 'custom') return sizes.map((size) => size.trim()).filter(Boolean);
  if (mode === 'clothes') {
    const clothesSet = new Set<string>(CLOTHES_SIZES);
    return sizes
      .map((size) => size.trim().toUpperCase())
      .filter((size) => clothesSet.has(size));
  }
  if (mode === 'kids') {
    const kidsSet = new Set<string>(KIDS_YEAR_SIZES);
    return sizes
      .map((size) => normalizeKidsYearLabel(size))
      .filter((size): size is string => size != null && kidsSet.has(size));
  }

  const selected = new Set(sizes.map((size) => size.trim().toUpperCase()));
  return {
    eu: SHOE_EU.filter((size) => selected.has(`EU ${size}`) || selected.has(size)).map((size) => `EU ${size}`),
    uk: SHOE_UK.filter((size) => selected.has(`UK ${size}`)).map((size) => `UK ${size}`),
    us: SHOE_US.filter((size) => selected.has(`US ${size}`)).map((size) => `US ${size}`),
  };
}

function parseCustomSizes(value: string) {
  return value
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean);
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function SizeChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-w-10 border px-3 py-2 text-xs font-medium',
        selected ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black',
      )}
    >
      {label}
    </button>
  );
}

export function ProductForm({ productId, categories, product, submitLabel }: ProductFormProps) {
  const [clientError, setClientError] = useState('');
  const [progress, setProgress] = useState<{ pct: number; label: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const watchdogRef = useRef<number | null>(null);

  function clearWatchdog() {
    if (watchdogRef.current != null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }

  const initialMode = guessSizeMode(product?.sizes ?? []);
  const [sizeMode, setSizeMode] = useState<SizeMode>(initialMode);
  const initialParsed = parseSelectedSizes(product?.sizes ?? [], initialMode);
  const [clothesSizes, setClothesSizes] = useState<string[]>(
    Array.isArray(initialParsed) && initialMode === 'clothes' ? initialParsed : [],
  );
  const [kidsSizes, setKidsSizes] = useState<string[]>(
    Array.isArray(initialParsed) && initialMode === 'kids' ? initialParsed : [],
  );
  const [shoeEu, setShoeEu] = useState<string[]>(
    !Array.isArray(initialParsed) ? initialParsed.eu : [],
  );
  const [shoeUk, setShoeUk] = useState<string[]>(
    !Array.isArray(initialParsed) ? initialParsed.uk : [],
  );
  const [shoeUs, setShoeUs] = useState<string[]>(
    !Array.isArray(initialParsed) ? initialParsed.us : [],
  );
  const [customSizesText, setCustomSizesText] = useState(
    initialMode === 'custom' ? (product?.sizes ?? []).join(', ') : '',
  );

  const sortedMedia = useMemo(
    () => [...(product?.media ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [product?.media],
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    sortedMedia
      .filter((item) => item.url)
      .slice(0, IMAGE_SLOTS)
      .map((item) => createGalleryItem({ url: item.url, preview: item.url })),
  );

  const selectedSizes =
    sizeMode === 'none'
      ? []
      : sizeMode === 'custom'
        ? parseCustomSizes(customSizesText)
        : sizeMode === 'clothes'
          ? clothesSizes
          : sizeMode === 'kids'
            ? kidsSizes
            : [...shoeEu, ...shoeUk, ...shoeUs];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setClientError('');
    setSubmitting(true);
    setProgress({ pct: 5, label: 'Preparing…' });
    clearWatchdog();
    watchdogRef.current = window.setTimeout(() => {
      setProgress(null);
      setSubmitting(false);
      setClientError('Save is taking too long. Refresh and try again with 1–2 smaller photos.');
    }, 90_000);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('sizes', selectedSizes.join(', '));

    try {
      const urls: string[] = [];
      const toUpload = gallery.filter((item) => item.file && !item.url);
      const totalSteps = Math.max(1, toUpload.length + 1);
      let done = 0;

      for (let index = 0; index < gallery.length; index += 1) {
        const item = gallery[index];
        if (item.url) {
          urls.push(item.url);
          continue;
        }
        if (!item.file) continue;

        setProgress({
          pct: Math.round((done / totalSteps) * 80) + 5,
          label: `Uploading photo ${done + 1} of ${toUpload.length}…`,
        });
        const url = await uploadImageFile(item.file, (pct) => {
          const base = Math.round((done / totalSteps) * 80) + 5;
          setProgress({
            pct: Math.min(85, base + Math.round(pct * 0.1)),
            label: `Uploading photo ${done + 1} of ${toUpload.length}…`,
          });
        });
        urls.push(url);
        done += 1;
        setGallery((prev) =>
          prev.map((g, i) => (i === index ? { ...g, url, file: null } : g)),
        );
      }

      for (let index = 0; index < IMAGE_SLOTS; index += 1) {
        formData.delete(`image${index}`);
        formData.set(`existingImageUrl${index}`, urls[index] || '');
      }

      setProgress({ pct: 90, label: 'Saving product…' });
      const endpoint = productId
        ? `/api/manage/products/${productId}`
        : '/api/manage/products';
      const response = await fetch(endpoint, {
        method: productId ? 'PATCH' : 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || `Save failed (${response.status})`);
      }

      clearWatchdog();
      setProgress({ pct: 100, label: 'Done — opening products…' });
      window.location.assign(payload.redirectTo || '/manage/products');
    } catch (error) {
      clearWatchdog();
      setProgress(null);
      setSubmitting(false);
      setClientError(error instanceof Error ? error.message : 'Could not save.');
    }
  }

  useEffect(() => () => clearWatchdog(), []);

  const error = clientError;
  const busy = submitting;

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-8">
      {error ? (
        <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {progress ? (
        <div className="border border-black/10 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>{progress.label}</span>
            <span className="font-medium">{progress.pct}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-neutral-100">
            <div className="h-full bg-black transition-all duration-200" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 border border-black/10 bg-white p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium" htmlFor="name">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name ?? ''}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={product?.slug ?? ''}
            placeholder="auto-generated from name"
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="sku">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            defaultValue={product?.sku ?? ''}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="brand">
            Brand
          </label>
          <input
            id="brand"
            name="brand"
            defaultValue={product?.brand ?? 'The Kerala Store'}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ''}
            className="mt-2 w-full border border-black/15 bg-white px-3 py-2 outline-none focus:border-black"
          >
            <option value="">Unassigned</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parentName ? `${category.parentName} / ${category.name}` : category.name}
                {category.isVisible === false ? ' (hidden)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="shortDescription">
            Short description
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            defaultValue={product?.shortDescription ?? ''}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? 'ACTIVE'}
            className="mt-2 w-full border border-black/15 bg-white px-3 py-2 outline-none focus:border-black"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium" htmlFor="longDescription">
            Long description
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            rows={5}
            defaultValue={product?.longDescription ?? ''}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>
      </section>

      <section className="grid gap-5 border border-black/10 bg-white p-5 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={fieldValue(product?.price)}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="salePrice">
            Sale price
          </label>
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={fieldValue(product?.salePrice)}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 1000}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div className="md:col-span-3">
          <p className="text-sm font-medium">Sizes</p>
          <input type="hidden" name="sizes" value={selectedSizes.join(', ')} readOnly />
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                { id: 'clothes', label: 'CLOTHES' },
                { id: 'kids', label: 'KIDS (1–12 YR)' },
                { id: 'shoes', label: 'SHOES' },
                { id: 'custom', label: 'CUSTOM' },
                { id: 'none', label: 'NO SIZE' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSizeMode(mode.id)}
                className={cn(
                  'border px-4 py-2 text-xs font-semibold tracking-[0.14em]',
                  sizeMode === mode.id ? 'border-black bg-black text-white' : 'border-black/15',
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {sizeMode === 'clothes' ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {CLOTHES_SIZES.map((size) => (
                <SizeChip
                  key={size}
                  label={size}
                  selected={clothesSizes.includes(size)}
                  onClick={() => setClothesSizes((current) => toggleValue(current, size))}
                />
              ))}
            </div>
          ) : null}

          {sizeMode === 'kids' ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {KIDS_YEAR_SIZES.map((size) => (
                <SizeChip
                  key={size}
                  label={size}
                  selected={kidsSizes.includes(size)}
                  onClick={() => setKidsSizes((current) => toggleValue(current, size))}
                />
              ))}
            </div>
          ) : null}

          {sizeMode === 'shoes' ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-black/55">EU</p>
                <div className="flex flex-wrap gap-2">
                  {SHOE_EU.map((size) => {
                    const value = `EU ${size}`;
                    return (
                      <SizeChip
                        key={value}
                        label={size}
                        selected={shoeEu.includes(value)}
                        onClick={() => setShoeEu((current) => toggleValue(current, value))}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-black/55">UK</p>
                <div className="flex flex-wrap gap-2">
                  {SHOE_UK.map((size) => {
                    const value = `UK ${size}`;
                    return (
                      <SizeChip
                        key={value}
                        label={size}
                        selected={shoeUk.includes(value)}
                        onClick={() => setShoeUk((current) => toggleValue(current, value))}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-black/55">US</p>
                <div className="flex flex-wrap gap-2">
                  {SHOE_US.map((size) => {
                    const value = `US ${size}`;
                    return (
                      <SizeChip
                        key={value}
                        label={size}
                        selected={shoeUs.includes(value)}
                        onClick={() => setShoeUs((current) => toggleValue(current, value))}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {sizeMode === 'custom' ? (
            <div className="mt-4">
              <label className="block text-sm text-black/60" htmlFor="customSizes">
                Type sizes separated by commas (e.g. S/M, L/XL, 7 1/8, ONE SIZE)
              </label>
              <textarea
                id="customSizes"
                value={customSizesText}
                onChange={(event) => setCustomSizesText(event.target.value)}
                rows={3}
                placeholder="S/M, L/XL, ONE SIZE"
                className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          ) : null}

          {sizeMode === 'none' ? (
            <p className="mt-4 text-sm text-black/55">
              No size options will be shown on the product page (good for accessories with no sizing).
            </p>
          ) : null}

          <p className="mt-3 text-xs text-black/50">
            Selected: {selectedSizes.length ? selectedSizes.join(', ') : 'none'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="colors">
            Colors
          </label>
          <input
            id="colors"
            name="colors"
            defaultValue={product?.colors.join(', ') ?? ''}
            placeholder="Black, Ivory"
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="tags">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={product?.tags.join(', ') ?? ''}
            placeholder="minimal, everyday"
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="material">
            Material
          </label>
          <input
            id="material"
            name="material"
            defaultValue={product?.material ?? ''}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="weight">
            Weight
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            step="0.01"
            defaultValue={fieldValue(product?.weight)}
            className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium">Featured slots</p>
          <p className="mt-1 text-sm text-black/55">
            Order is managed on the Products page — each of WOMEN / KIDS / MEN has 3 slots. Checking
            Featured here fills the next open slot for this product&apos;s audience line.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} />
          Featured
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input name="newArrival" type="checkbox" defaultChecked={product?.newArrival ?? false} />
          New arrival
        </label>
      </section>

      <section className="border border-black/10 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Product images</h2>
          <p className="mt-1 text-sm text-black/55">
            Add up to 15 photos (drag &amp; drop or click the box). They optimize on your phone/computer;
            upload starts only when you hit Create / Save.
          </p>
        </div>
        <ProductImageGallery items={gallery} onChange={setGallery} max={IMAGE_SLOTS} />
        {gallery.map((item, index) => (
          <input key={`hidden-${item.key}`} type="hidden" name={`existingImageUrl${index}`} value={item.url} readOnly />
        ))}
      </section>

      <div className="space-y-3">
        {progress ? (
          <div className="border border-black/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{progress.label}</span>
              <span className="font-medium">{progress.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden bg-neutral-100">
              <div className="h-full bg-black transition-all duration-200" style={{ width: `${progress.pct}%` }} />
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="min-w-[180px] bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-80"
          >
            {busy
              ? progress
                ? `${progress.pct}% · ${progress.label}`
                : 'Saving…'
              : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
