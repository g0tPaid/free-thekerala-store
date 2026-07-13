import {
  createCategory,
  deleteCategory,
  ensureAudienceParents,
  updateCategory,
} from "@/app/manage/actions/categories";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AUDIENCE_SLUGS = new Set(["women", "kids", "men"]);

const AUDIENCE_LABELS: Record<string, string> = {
  women: "🌸 ഓൾക്ക് · WOMEN",
  kids: "🧒 കുട്ട്യേൾക്ക് · KIDS",
  men: "💙 ഓന് · MEN",
};

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const audienceParents = categories
    .filter((category) => !category.parentId && AUDIENCE_SLUGS.has(category.slug))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const otherTopLevel = categories.filter(
    (category) => !category.parentId && !AUDIENCE_SLUGS.has(category.slug),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold">Categories</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/55">
            Parents are only <span className="font-medium text-black">WOMEN / KIDS / MEN</span> (home
            toggles). Everything else — HOME, SPICES, FOOD, CARE, APPAREL — must be a{" "}
            <span className="font-medium text-black">child</span> under one parent. Products attach to
            children.
          </p>
        </div>
        <form action={ensureAudienceParents}>
          <button
            type="submit"
            className="bg-[#4f8f6e] px-4 py-2.5 text-sm font-semibold tracking-[0.08em] text-white"
          >
            Setup WOMEN / KIDS / MEN parents
          </button>
        </form>
      </div>

      <section className="border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Add child category</h2>
        <p className="mt-1 text-sm text-black/55">
          Pick a parent first (WOMEN, KIDS, or MEN), then name the child (e.g. APPAREL).
        </p>
        <form action={createCategory} className="mt-5 grid gap-4 md:grid-cols-6">
          <select
            name="parentId"
            required
            defaultValue=""
            className="border border-black/15 bg-white px-3 py-2 md:col-span-2"
          >
            <option value="" disabled>
              Parent (required)
            </option>
            {audienceParents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {AUDIENCE_LABELS[parent.slug] ?? parent.name}
              </option>
            ))}
          </select>
          <input
            name="name"
            required
            placeholder="Child name (HOME, APPAREL…)"
            className="border border-black/15 px-3 py-2 md:col-span-2"
          />
          <input name="slug" placeholder="Slug" className="border border-black/15 px-3 py-2" />
          <input
            name="sortOrder"
            type="number"
            placeholder="Sort"
            className="border border-black/15 px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input name="isVisible" type="checkbox" defaultChecked />
            Visible on store
          </label>
          <input
            name="description"
            placeholder="Description"
            className="border border-black/15 px-3 py-2 md:col-span-3"
          />
          <button type="submit" className="bg-black px-4 py-2 text-sm font-medium text-white">
            Add child
          </button>
        </form>
        {!audienceParents.length ? (
          <p className="mt-4 text-sm text-amber-800">
            No audience parents yet — click <strong>Setup WOMEN / KIDS / MEN parents</strong> above.
          </p>
        ) : null}
      </section>

      {audienceParents.map((parent) => (
        <section key={parent.id} className="space-y-3 border border-black/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3">
            <div>
              <h2 className="text-xl font-semibold">
                {AUDIENCE_LABELS[parent.slug] ?? parent.name}
              </h2>
              <p className="mt-1 text-xs text-black/50">
                Parent · slug `{parent.slug}` · {parent.children.length} child categories
              </p>
            </div>
            <form action={updateCategory.bind(null, parent.id)} className="flex flex-wrap gap-2">
              <input type="hidden" name="name" value={parent.name} />
              <input type="hidden" name="slug" value={parent.slug} />
              <input type="hidden" name="parentId" value="" />
              <input type="hidden" name="sortOrder" value={parent.sortOrder} />
              <input type="hidden" name="description" value={parent.description ?? ""} />
              <label className="flex items-center gap-2 text-sm">
                <input name="isVisible" type="checkbox" defaultChecked={parent.isVisible} />
                Visible
              </label>
              <button type="submit" className="underline underline-offset-4">
                Save parent
              </button>
            </form>
          </div>

          {parent.children.map((child) => (
            <form
              key={child.id}
              action={updateCategory.bind(null, child.id)}
              className="grid gap-3 border border-black/10 bg-[#faf8f3] p-4 md:grid-cols-12"
            >
              <input
                name="name"
                defaultValue={child.name}
                className="border border-black/15 bg-white px-3 py-2 md:col-span-2"
              />
              <input
                name="slug"
                defaultValue={child.slug}
                className="border border-black/15 bg-white px-3 py-2 md:col-span-2"
              />
              <select
                name="parentId"
                defaultValue={child.parentId ?? parent.id}
                className="border border-black/15 bg-white px-3 py-2 md:col-span-2"
              >
                {audienceParents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {AUDIENCE_LABELS[item.slug] ?? item.name}
                  </option>
                ))}
              </select>
              <input
                name="description"
                defaultValue={child.description ?? ""}
                className="border border-black/15 bg-white px-3 py-2 md:col-span-3"
              />
              <input
                name="sortOrder"
                type="number"
                defaultValue={child.sortOrder}
                className="border border-black/15 bg-white px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input name="isVisible" type="checkbox" defaultChecked={child.isVisible} />
                Visible
              </label>
              <div className="flex items-center justify-between gap-3 md:col-span-12">
                <p className="text-xs text-black/50">{child._count.products} product(s)</p>
                <div className="flex gap-3">
                  <button type="submit" className="underline underline-offset-4">
                    Save
                  </button>
                  <button
                    formAction={deleteCategory.bind(null, child.id)}
                    className="text-red-700 underline underline-offset-4"
                    type="submit"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </form>
          ))}

          {!parent.children.length ? (
            <p className="text-sm text-black/50">No children yet under this parent.</p>
          ) : null}
        </section>
      ))}

      {otherTopLevel.length ? (
        <section className="space-y-3 border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-950">Other top-level (fix these)</h2>
          <p className="text-sm text-amber-900/80">
            These are not WOMEN/KIDS/MEN. Move them under a parent, or hide/delete legacy SHOP/GIFTS.
          </p>
          {otherTopLevel.map((category) => (
            <form
              key={category.id}
              action={updateCategory.bind(null, category.id)}
              className="grid gap-3 border border-amber-200 bg-white p-4 md:grid-cols-12"
            >
              <input
                name="name"
                defaultValue={category.name}
                className="border border-black/15 px-3 py-2 md:col-span-2"
              />
              <input
                name="slug"
                defaultValue={category.slug}
                className="border border-black/15 px-3 py-2 md:col-span-2"
              />
              <select
                name="parentId"
                defaultValue=""
                className="border border-black/15 bg-white px-3 py-2 md:col-span-3"
              >
                <option value="">Keep as top-level</option>
                {audienceParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    Move under {AUDIENCE_LABELS[parent.slug] ?? parent.name}
                  </option>
                ))}
              </select>
              <input
                name="sortOrder"
                type="number"
                defaultValue={category.sortOrder}
                className="border border-black/15 px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input name="isVisible" type="checkbox" defaultChecked={category.isVisible} />
                Visible
              </label>
              <input type="hidden" name="description" value={category.description ?? ""} />
              <div className="flex items-center justify-between gap-3 md:col-span-12">
                <p className="text-xs text-black/50">{category._count.products} product(s)</p>
                <div className="flex gap-3">
                  <button type="submit" className="underline underline-offset-4">
                    Save
                  </button>
                  <button
                    formAction={deleteCategory.bind(null, category.id)}
                    className="text-red-700 underline underline-offset-4"
                    type="submit"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </form>
          ))}
        </section>
      ) : null}
    </div>
  );
}
