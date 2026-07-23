import Link from "next/link";

import {
  deleteProduct,
  moveFeaturedProduct,
  toggleFeaturedProduct,
  toggleProductSale,
} from "@/app/manage/actions/products";
import { requireAdmin } from "@/lib/auth";
import {
  catalogLineFromCategory,
  MAX_FEATURED_BY_LINE,
  maxFeaturedForLine,
  type CatalogLine,
} from "@/lib/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LINE_LABEL: Record<CatalogLine, string> = {
  WOMEN: "WOMEN",
  KIDS: "KIDS",
  MEN: "MEN",
};

type ProductsPageProps = {
  searchParams?: Promise<{ q?: string; sort?: string; featuredError?: string; line?: string }>;
};

function money(value: unknown) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const sort = params?.sort === "price-asc" || params?.sort === "price-desc" ? params.sort : "newest";
  const listQuery = new URLSearchParams();
  if (query) listQuery.set("q", query);
  if (sort !== "newest") listQuery.set("sort", sort);
  const listReturnTo = `/manage/products${listQuery.toString() ? `?${listQuery}` : ""}`;
  const featuredError = params?.featuredError;
  const limitedLine =
    params?.line === "WOMEN" || params?.line === "KIDS" || params?.line === "MEN"
      ? (params.line as CatalogLine)
      : null;

  const productSelect = {
    id: true,
    name: true,
    slug: true,
    sku: true,
    price: true,
    salePrice: true,
    stock: true,
    status: true,
    featured: true,
    homepageOrder: true,
    category: {
      select: {
        name: true,
        slug: true,
        parent: { select: { name: true, slug: true } },
      },
    },
    media: {
      orderBy: { sortOrder: "asc" as const },
      take: 1,
      select: { url: true, alt: true },
    },
  };

  const [products, featuredProducts] = await Promise.all([
    prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: productSelect,
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.product.findMany({
      where: { featured: true },
      select: productSelect,
      orderBy: [{ homepageOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return Number(a.price) - Number(b.price);
    if (sort === "price-desc") return Number(b.price) - Number(a.price);
    return 0;
  });

  const featuredByLine: Record<CatalogLine, typeof featuredProducts> = {
    WOMEN: featuredProducts.filter(
      (product) => catalogLineFromCategory(product.category) === "WOMEN",
    ),
    KIDS: featuredProducts.filter((product) => catalogLineFromCategory(product.category) === "KIDS"),
    MEN: featuredProducts.filter((product) => catalogLineFromCategory(product.category) === "MEN"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold">Products</h1>
          <p className="mt-2 text-sm text-black/55">
            Featured slots: WOMEN {featuredByLine.WOMEN.length}/{MAX_FEATURED_BY_LINE.WOMEN} · KIDS{" "}
            {featuredByLine.KIDS.length}/{MAX_FEATURED_BY_LINE.KIDS} · MEN {featuredByLine.MEN.length}/
            {MAX_FEATURED_BY_LINE.MEN} — Women has 6 spots; Kids &amp; Men have 3 each
          </p>
        </div>
        <Link href="/manage/products/new" className="bg-black px-4 py-2 text-sm font-medium text-white">
          New product
        </Link>
      </div>

      {featuredError === "limit" ? (
        <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
          All {limitedLine ? maxFeaturedForLine(limitedLine) : ""}{" "}
          {limitedLine ? LINE_LABEL[limitedLine] : ""} featured slots are
          full. Remove one from that line&apos;s slots above, then feature another.
        </div>
      ) : null}

      {(["WOMEN", "KIDS", "MEN"] as CatalogLine[]).map((line) => {
        const lineFeatured = featuredByLine[line];
        const featuredCount = lineFeatured.length;
        const lineMax = maxFeaturedForLine(line);
        const featuredSlots = Array.from({ length: lineMax }, (_, index) => {
          return lineFeatured[index] ?? null;
        });

        return (
          <section key={line} className="border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{LINE_LABEL[line]} featured slots</h2>
                <p className="mt-1 text-sm text-black/55">
                  Fixed {lineMax} spots for the {LINE_LABEL[line]} tab. Remove frees a
                  slot. Numbers stay 1–{featuredCount || 0} in order.
                </p>
              </div>
              <p className="text-sm font-medium text-black/70">
                {featuredCount} filled · {lineMax - featuredCount} open
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {featuredSlots.map((product, index) => {
                const slot = index + 1;
                if (!product) {
                  return (
                    <div
                      key={`${line}-empty-${slot}`}
                      className="flex min-h-[108px] flex-col justify-between border border-dashed border-black/20 bg-neutral-50 px-4 py-3"
                    >
                      <p className="text-xs font-semibold tracking-[0.16em] text-black/40">
                        SLOT {slot}
                      </p>
                      <p className="text-sm text-black/45">Empty — use Feature in the list</p>
                    </div>
                  );
                }

                const thumb = product.media[0]?.url;
                return (
                  <div
                    key={product.id}
                    className="flex min-h-[108px] flex-col justify-between border border-emerald-600/30 bg-emerald-50/50 px-4 py-3"
                  >
                    <div className="flex gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden border border-black/10 bg-white">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={product.media[0]?.alt || product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-black/35">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800">
                          #{slot}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium">{product.name}</p>
                        <p className="truncate text-xs text-black/50">{product.sku ?? product.slug}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={moveFeaturedProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={slot === 1}
                          className="border border-black/20 px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ↑ Up
                        </button>
                      </form>
                      <form action={moveFeaturedProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={slot === featuredCount}
                          className="border border-black/20 px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ↓ Down
                        </button>
                      </form>
                      <form action={toggleFeaturedProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="border border-red-700/40 px-2 py-1 text-xs text-red-700"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <form className="flex flex-col gap-2 sm:flex-row sm:items-center" action="/manage/products">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name, slug, or SKU"
          className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
          aria-label="Sort products"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <button className="border border-black px-4 py-2 text-sm font-medium" type="submit">
          Apply
        </button>
      </form>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedProducts.map((product) => {
            const thumb = product.media[0]?.url;
            const line = catalogLineFromCategory(product.category);
            const lineFeatured = featuredByLine[line];
            const slot = product.featured
              ? lineFeatured.findIndex((item) => item.id === product.id) + 1
              : 0;
            const onSale =
              typeof product.salePrice === "number" &&
              Number.isFinite(product.salePrice) &&
              product.salePrice > 0 &&
              product.salePrice < product.price;
            return (
              <article
                key={product.id}
                className={`overflow-hidden border bg-white ${
                  product.featured ? "border-emerald-600/40" : "border-black/10"
                }`}
              >
                <div className="relative aspect-[3/4] bg-neutral-100">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={product.media[0]?.alt || product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-black/35">
                      N/A
                    </div>
                  )}
                  {onSale ? (
                    <span className="pointer-events-none absolute -left-7 top-3 w-28 -rotate-45 bg-red-600 py-1 text-center text-[8px] font-bold uppercase tracking-[0.14em] text-white shadow">
                      Sale
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2 p-3">
                  <div>
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
                    <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-black/45">
                      {LINE_LABEL[line]} · {product.category?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <p className="text-sm">
                    {onSale ? (
                      <>
                        <span className="font-semibold text-emerald-700">{money(product.salePrice)}</span>{" "}
                        <span className="text-black/40 line-through">{money(product.price)}</span>
                      </>
                    ) : (
                      <span className="font-semibold">{money(product.price)}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-black/50">
                    Stock {product.stock} · {product.status}
                  </p>
                  <form action={toggleProductSale}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="returnTo" value={listReturnTo} />
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 text-left text-xs"
                      aria-pressed={onSale}
                    >
                      <span
                        className={`grid size-3.5 place-items-center border ${
                          onSale ? "border-red-600 bg-red-600 text-white" : "border-black/30 bg-white"
                        }`}
                        aria-hidden
                      >
                        {onSale ? "✓" : ""}
                      </span>
                      On sale (−10%)
                    </button>
                  </form>
                  <form action={toggleFeaturedProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <button
                      type="submit"
                      className={
                        product.featured
                          ? "w-full bg-emerald-600 px-2 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-white"
                          : "w-full border border-black/20 px-2 py-1.5 text-[10px] font-semibold tracking-[0.1em] hover:border-black"
                      }
                    >
                      {product.featured ? `FEATURED #${slot}` : "ADD TO FEATURED"}
                    </button>
                  </form>
                  <div className="flex gap-3 pt-1 text-xs">
                    <Link
                      href={`/manage/products/edit/${product.id}`}
                      className="underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        className="text-red-700 underline underline-offset-4"
                        type="submit"
                        formNoValidate
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!sortedProducts.length ? (
          <p className="border border-black/10 bg-white p-5 text-sm text-black/55">
            No products found. Create your first Kerala Store product to start the catalog.
          </p>
        ) : null}
      </section>
    </div>
  );
}
