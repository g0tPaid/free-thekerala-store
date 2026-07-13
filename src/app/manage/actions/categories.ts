"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  const field = formData.get(key);
  return typeof field === "string" ? field.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const field = value(formData, key);
  return field.length ? field : null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function bustCategoryCache() {
  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/manage/categories");
  revalidatePath("/manage/products");
}

const AUDIENCE_PARENTS = [
  { name: "WOMEN", slug: "women", sortOrder: 0, description: "🌸 ഓൾക്ക്" },
  { name: "KIDS", slug: "kids", sortOrder: 1, description: "🧒 കുട്ട്യേൾക്ക്" },
  { name: "MEN", slug: "men", sortOrder: 2, description: "💙 ഓന്" },
] as const;

export async function ensureAudienceParents() {
  await requireAdmin();

  for (const parent of AUDIENCE_PARENTS) {
    await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description,
        sortOrder: parent.sortOrder,
        isVisible: true,
        parentId: null,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        sortOrder: parent.sortOrder,
        isVisible: true,
        parentId: null,
      },
    });
  }

  // Hide legacy top-level SHOP / GIFTS so they stop confusing the toggles
  await prisma.category.updateMany({
    where: {
      parentId: null,
      slug: { in: ["shop", "gifts"] },
    },
    data: { isVisible: false },
  });

  bustCategoryCache();
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name");
  const parentId = optionalValue(formData, "parentId");

  await prisma.category.create({
    data: {
      name,
      slug: value(formData, "slug") || slugify(name),
      description: optionalValue(formData, "description"),
      imageUrl: optionalValue(formData, "imageUrl"),
      sortOrder: Number(value(formData, "sortOrder")) || 0,
      isVisible: formData.get("isVisible") === "on",
      parentId,
    },
  });

  bustCategoryCache();
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name");
  const parentId = optionalValue(formData, "parentId");

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: value(formData, "slug") || slugify(name),
      description: optionalValue(formData, "description"),
      imageUrl: optionalValue(formData, "imageUrl"),
      sortOrder: Number(value(formData, "sortOrder")) || 0,
      isVisible: formData.get("isVisible") === "on",
      parentId: parentId === id ? null : parentId,
    },
  });

  bustCategoryCache();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({
    where: { id },
  });

  bustCategoryCache();
}
