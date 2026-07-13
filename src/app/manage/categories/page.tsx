import {
  createCategory,
  deleteCategory,
  ensureAudienceParents,
  syncAudienceParents,
  updateCategory,
} from "@/app/manage/actions/categories";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AUDIENCE_ORDER = ["women", "kids", "men"] as const;

const AUDIENCE_LABELS: Record<string, string> = {
  women: "🌸 ഓൾക്ക് · WOMEN",
  kids: "🧒 കുട്ട്യേൾക്ക് · KIDS",
  men: "💙 ഓന് · MEN",
};

function audienceLabel(category: { slug: string; name: string }) {
  if (AUDIENCE_LABELS[category.slug]) return AUDIENCE_LABELS[category.slug];
  return category.name;
}

export default async function AdminCategoriesPage() {
  await requireAdmin();
  // Always ensure WOMEN / KIDS / MEN exist as top-level parents
  await syncAudienceParents();

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

  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const audienceParents = AUDIENCE_ORDER.map((slug) => bySlug.get(slug)).filter(
    (category): category is NonNullable<typeof category> => Boolean(category),
  );

  const audienceIds = new Set(audienceParents.map((parent) => parent.id));
  const otherTopLevel = categories.filter(
    (category) => !category.parentId && !audienceIds.has(category.id),
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
            Setup / fix WOMEN · KIDS · MEN parents
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
                {audienceLabel(parent)}
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
        {audienceParents.length < 3 ? (
          <p className="mt-4 text-sm text-amber-800">
            Missing a parent — click <strong>Setup / fix WOMEN · KIDS · MEN parents</strong> above.
          </p>
        ) : null}
      </section>

      {audienceParents.map((parent) => (
        <section key={parent.id} className="space-y-3 border border-black/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3">
            <div>
              <h2 className="text-xl font-semibold">{audienceLabel(parent)}</h2>
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

          {parent.children.length ? (
            parent.children.map((child) => (
              <form
                key={child.id}
                action={updateCategory.bind(null, child.id)}
                className="grid gap-3 border border-black/10 p-4 md:grid-cols-6"
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
                  defaultValue={parent.id}
                  className="border border-black/15 bg-white px-3 py-2 md:col-span-2"
                >
                  {audienceParents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {audienceLabel(item)}
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
                <div className="flex items-center gap-3 text-sm md:col-span-2">
                  <span className="text-black/45">{child._count.products} product(s)</span>
                  <button type="submit" className="underline underline-offset-4">
                    Save
                  </button>
                  <button
                    type="submit"
                    formAction={deleteCategory.bind(null, child.id)}
                    className="text-red-700 underline underline-offset-4"
                  >
                    Delete
                  </button>
                </div>
              </form>
            ))
          ) : (
            <p className="text-sm text-black/45">No child categories yet — add one above.</p>
          )}
        </section>
      ))}

      {otherTopLevel.length ? (
        <section className="space-y-3 border border-amber-200 bg-amber-50/60 p-5">
          <div>
            <h2 className="text-lg font-semibold">Other top-level (fix these)</h2>
            <p className="mt-1 text-sm text-black/55">
              These are not WOMEN/KIDS/MEN. Move them under a parent, or hide/delete legacy SHOP/GIFTS.
            </p>
          </div>
          {otherTopLevel.map((category) => (
            <form
              key={category.id}
              action={updateCategory.bind(null, category.id)}
              className="grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-6"
            >
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-black/40">
                  {category.name} / {category.slug}
                </p>
                <input
                  name="name"
                  defaultValue={category.name}
                  className="mt-1 w-full border border-black/15 px-3 py-2"
                />
              </div>
              <input
                name="slug"
                defaultValue={category.slug}
                className="border border-black/15 px-3 py-2 md:col-span-2"
              />
              <select
                name="parentId"
                defaultValue=""
                className="border border-black/15 bg-white px-3 py-2 md:col-span-2"
              >
                <option value="">Keep as top-level</option>
                {audienceParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    Move under {audienceLabel(parent)}
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
              <div className="flex items-center gap-3 text-sm md:col-span-3">
                <span className="text-black/45">{category._count.products} product(s)</span>
                <button type="submit" className="underline underline-offset-4">
                  Save
                </button>
                <button
                  type="submit"
                  formAction={deleteCategory.bind(null, category.id)}
                  className="text-red-700 underline underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </form>
          ))}
        </section>
      ) : null}
    </div>
  );
}
