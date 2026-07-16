"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function value(formData: FormData, key: string) {
  const field = formData.get(key);
  return typeof field === "string" ? field.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const field = value(formData, key);
  return field.length ? field : null;
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: value(formData, "siteName") || "The Kerala Store",
      logoUrl: optionalValue(formData, "logoUrl"),
      faviconUrl: optionalValue(formData, "faviconUrl"),
      instagramUrl: optionalValue(formData, "instagramUrl"),
      tiktokUrl: optionalValue(formData, "tiktokUrl"),
      whatsappNumber: optionalValue(formData, "whatsappNumber"),
      metaTitle: optionalValue(formData, "metaTitle"),
      metaDescription: optionalValue(formData, "metaDescription"),
      currency: value(formData, "currency") || "INR",
      banner1Url: optionalValue(formData, "banner1Url"),
      banner2Url: optionalValue(formData, "banner2Url"),
      banner3Url: optionalValue(formData, "banner3Url"),
      banner1Link: optionalValue(formData, "banner1Link"),
      banner2Link: optionalValue(formData, "banner2Link"),
      banner3Link: optionalValue(formData, "banner3Link"),
    },
    create: {
      id: "default",
      siteName: value(formData, "siteName") || "The Kerala Store",
      logoUrl: optionalValue(formData, "logoUrl"),
      faviconUrl: optionalValue(formData, "faviconUrl"),
      instagramUrl: optionalValue(formData, "instagramUrl"),
      tiktokUrl: optionalValue(formData, "tiktokUrl"),
      whatsappNumber: optionalValue(formData, "whatsappNumber"),
      metaTitle: optionalValue(formData, "metaTitle"),
      metaDescription: optionalValue(formData, "metaDescription"),
      currency: value(formData, "currency") || "INR",
      banner1Url: optionalValue(formData, "banner1Url"),
      banner2Url: optionalValue(formData, "banner2Url"),
      banner3Url: optionalValue(formData, "banner3Url"),
      banner1Link: optionalValue(formData, "banner1Link"),
      banner2Link: optionalValue(formData, "banner2Link"),
      banner3Link: optionalValue(formData, "banner3Link"),
    },
  });

  revalidatePath("/");
  revalidatePath("/manage/settings");
  revalidatePath("/manage/settings#banners");
}

export async function saveBannerSlot(index: 1 | 2 | 3, imageUrl: string) {
  await requireAdmin();
  const url = imageUrl.trim();
  if (!url) throw new Error("Banner URL is required.");

  const data =
    index === 1
      ? { banner1Url: url }
      : index === 2
        ? { banner2Url: url }
        : { banner3Url: url };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: {
      id: "default",
      siteName: "The Kerala Store",
      currency: "INR",
      ...data,
    },
  });

  revalidatePath("/");
  revalidatePath("/manage/settings");
}

export async function setBannersEnabled(formData: FormData) {
  await requireAdmin();
  const enabled = formData.get("enabled") === "1";

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { bannersEnabled: enabled },
    create: {
      id: "default",
      siteName: "The Kerala Store",
      currency: "INR",
      bannersEnabled: enabled,
    },
  });

  revalidatePath("/");
  revalidatePath("/manage/banners");
  revalidatePath("/manage/settings");
}
