import Link from "next/link";

import { BannerSlotField } from "@/components/admin/banner-slot-field";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  await requireAdmin();

  let banner1Url = "";
  let banner2Url = "";
  let banner3Url = "";
  let banner1Link = "";
  let banner2Link = "";
  let banner3Link = "";

  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        banner1Url: true,
        banner2Url: true,
        banner3Url: true,
        banner1Link: true,
        banner2Link: true,
        banner3Link: true,
      },
    });
    banner1Url = settings?.banner1Url ?? "";
    banner2Url = settings?.banner2Url ?? "";
    banner3Url = settings?.banner3Url ?? "";
    banner1Link = settings?.banner1Link ?? "";
    banner2Link = settings?.banner2Link ?? "";
    banner3Link = settings?.banner3Link ?? "";
  } catch {
    // empty defaults
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Storefront</p>
          <h1 className="mt-2 text-3xl font-semibold">Banners</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/55">
            Upload up to 3 homepage banners. Size{" "}
            <span className="font-medium text-black">1200 × 500 px</span> (12:5). Uploads save
            immediately and show on the shop.
          </p>
        </div>
        <Link href="/manage/settings" className="text-sm underline underline-offset-4">
          All settings
        </Link>
      </div>

      <div className="grid gap-5">
        <BannerSlotField index={1} defaultUrl={banner1Url} defaultLink={banner1Link} />
        <BannerSlotField index={2} defaultUrl={banner2Url} defaultLink={banner2Link} />
        <BannerSlotField index={3} defaultUrl={banner3Url} defaultLink={banner3Link} />
      </div>
    </div>
  );
}
