import { prisma } from "@/lib/prisma";

const AUDIENCE_PARENTS = [
  { name: "WOMEN", slug: "women", sortOrder: 0, description: "🌸 ഓൾക്ക്" },
  { name: "KIDS", slug: "kids", sortOrder: 1, description: "🧒 കുട്ട്യേൾക്ക്" },
  { name: "MEN", slug: "men", sortOrder: 2, description: "💙 ഓന്" },
] as const;

/** Rename legacy slug → audience slug, or merge children into existing audience parent. */
async function migrateLegacyParent(legacySlug: string, targetSlug: string) {
  const legacy = await prisma.category.findUnique({ where: { slug: legacySlug } });
  if (!legacy) return;

  const target = await prisma.category.findUnique({ where: { slug: targetSlug } });
  const audience = AUDIENCE_PARENTS.find((item) => item.slug === targetSlug);
  if (!audience) return;

  if (!target) {
    await prisma.category.update({
      where: { id: legacy.id },
      data: {
        name: audience.name,
        slug: audience.slug,
        description: audience.description,
        sortOrder: audience.sortOrder,
        isVisible: true,
        parentId: null,
      },
    });
    return;
  }

  if (legacy.id === target.id) return;

  await prisma.category.updateMany({
    where: { parentId: legacy.id },
    data: { parentId: target.id },
  });

  await prisma.product.updateMany({
    where: { categoryId: legacy.id },
    data: { categoryId: target.id },
  });

  await prisma.category.update({
    where: { id: legacy.id },
    data: {
      isVisible: false,
      parentId: null,
      name: `LEGACY ${legacy.name}`,
      slug: `legacy-${legacy.slug}-${legacy.id.slice(-4)}`,
    },
  });
}

/** Force WOMEN / KIDS / MEN to exist as top-level parents (idempotent). Not a Server Action. */
export async function syncAudienceParents() {
  await migrateLegacyParent("shop", "women");
  await migrateLegacyParent("gifts", "men");

  for (const parent of AUDIENCE_PARENTS) {
    const existing = await prisma.category.findUnique({ where: { slug: parent.slug } });

    if (existing) {
      if (
        existing.parentId !== null ||
        existing.name !== parent.name ||
        existing.sortOrder !== parent.sortOrder ||
        !existing.isVisible
      ) {
        await prisma.category.update({
          where: { id: existing.id },
          data: {
            name: parent.name,
            description: parent.description,
            sortOrder: parent.sortOrder,
            isVisible: true,
            parentId: null,
          },
        });
      }
      continue;
    }

    const byName = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: parent.name, mode: "insensitive" } },
          { name: { equals: parent.description, mode: "insensitive" } },
        ],
        slug: { not: { startsWith: "legacy-" } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (byName) {
      const slugTaken = await prisma.category.findUnique({ where: { slug: parent.slug } });
      if (slugTaken && slugTaken.id !== byName.id) {
        await prisma.category.update({
          where: { id: slugTaken.id },
          data: { slug: `legacy-${slugTaken.slug}-${slugTaken.id.slice(-4)}` },
        });
      }

      await prisma.category.update({
        where: { id: byName.id },
        data: {
          name: parent.name,
          slug: parent.slug,
          description: parent.description,
          sortOrder: parent.sortOrder,
          isVisible: true,
          parentId: null,
        },
      });
      continue;
    }

    await prisma.category.create({
      data: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        sortOrder: parent.sortOrder,
        isVisible: true,
        parentId: null,
      },
    });
  }
}
