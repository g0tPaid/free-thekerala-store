import Link from "next/link";

import {
  deleteProduct,
  moveFeaturedProduct,
  toggleFeaturedProduct,
} from "@/app/manage/actions/products";
import { requireAdmin } from "@/lib/auth";
import {
  catalogLineFromCategory,
  MAX_FEATURED_PER_LINE,
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
  searchParams?: Promise<{ q?: string; featuredError?: string; line?: string }>;
};

function money(value: unknown) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
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
            Featured slots: WOMEN {featuredByLine.WOMEN.length}/{MAX_FEATURED_PER_LINE} · KIDS{" "}
            {featuredByLine.KIDS.length}/{MAX_FEATURED_PER_LINE} · MEN {featuredByLine.MEN.length}/
            {MAX_FEATURED_PER_LINE} — each audience tab has its own 3 spots
          </p>
        </div>
        <Link href="/manage/products/new" className="bg-black px-4 py-2 text-sm font-medium text-white">
          New product
        </Link>
      </div>

      {featuredError === "limit" ? (
        <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
          All {MAX_FEATURED_PER_LINE} {limitedLine ? LINE_LABEL[limitedLine] : ""} featured slots are
          full. Remove one from that line&apos;s slots above, then feature another.
        </div>
      ) : null}

      {(["WOMEN", "KIDS", "MEN"] as CatalogLine[]).map((line) => {
        const lineFeatured = featuredByLine[line];
        const featuredCount = lineFeatured.length;
        const featuredSlots = Array.from({ length: MAX_FEATURED_PER_LINE }, (_, index) => {
          return lineFeatured[index] ?? null;
        });

        return (
          <section key={line} className="border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{LINE_LABEL[line]} featured slots</h2>
                <p className="mt-1 text-sm text-black/55">
                  Fixed {MAX_FEATURED_PER_LINE} spots for the {LINE_LABEL[line]} tab. Remove frees a
                  slot. Numbers stay 1–{featuredCount || 0} in order.
                </p>
              </div>
              <p className="text-sm font-medium text-black/70">
                {featuredCount} filled · {MAX_FEATURED_PER_LINE - featuredCount} open
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

      <form className="flex gap-2" action="/manage/products">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name, slug, or SKU"
          className="w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button className="border border-black px-4 py-2 text-sm font-medium" type="submit">
          Search
        </button>
      </form>

      <section className="overflow-hidden border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-black/10 bg-neutral-50 text-black/55">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Line</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {products.map((product) => {
                const thumb = product.media[0]?.url;
                const line = catalogLineFromCategory(product.category);
                const lineFeatured = featuredByLine[line];
                const slot = product.featured
                  ? lineFeatured.findIndex((item) => item.id === product.id) + 1
                  : 0;
                return (
                  <tr key={product.id} className={product.featured ? "bg-emerald-50/40" : undefined}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden border border-black/10 bg-neutral-100">
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
                          <div className="font-medium">{product.name}</div>
                          <div className="mt-1 truncate text-xs text-black/50">
                            {product.sku ?? product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold tracking-[0.12em]">
                      {LINE_LABEL[line]}
                    </td>
                    <td className="px-4 py-4">{product.category?.name ?? "Unassigned"}</td>
                    <td className="px-4 py-4">
                      {product.salePrice ? (
                        <span>
                          {money(product.salePrice)}{" "}
                          <span className="text-black/40 line-through">{money(product.price)}</span>
                        </span>
                      ) : (
                        money(product.price)
                      )}
                    </td>
                    <td className="px-4 py-4">{product.stock}</td>
                    <td className="px-4 py-4">{product.status}</td>
                    <td className="px-4 py-4">
                      <form action={toggleFeaturedProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className={
                            product.featured
                              ? "bg-emerald-600 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-white"
                              : "border border-black/20 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] hover:border-black"
                          }
                        >
                          {product.featured ? `IN SLOT #${slot}` : "ADD TO FEATURED"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-3">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!products.length ? (
          <p className="border-t border-black/10 p-5 text-sm text-black/55">
            No products found. Create your first Kerala Store product to start the catalog.
          </p>
        ) : null}
      </section>
    </div>
  );
}
