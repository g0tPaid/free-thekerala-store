import Link from "next/link";

import { setBannersEnabled } from "@/app/manage/actions/settings";
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
  let bannersEnabled = true;

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
        bannersEnabled: true,
      },
    });
    banner1Url = settings?.banner1Url ?? "";
    banner2Url = settings?.banner2Url ?? "";
    banner3Url = settings?.banner3Url ?? "";
    banner1Link = settings?.banner1Link ?? "";
    banner2Link = settings?.banner2Link ?? "";
    banner3Link = settings?.banner3Link ?? "";
    bannersEnabled = settings?.bannersEnabled ?? true;
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

      <section className="border border-black/10 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Homepage image banners</h2>
            <p className="mt-1 text-sm text-black/55">
              {bannersEnabled
                ? "ON — top image banners show. Malayalam ticker stays under the filters."
                : "OFF — image banners hidden. Malayalam ticker moves under the first 6 products."}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={setBannersEnabled}>
              <input type="hidden" name="enabled" value="1" />
              <button
                type="submit"
                className={
                  bannersEnabled
                    ? "bg-black px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-white"
                    : "border border-black/20 px-4 py-2.5 text-xs font-semibold tracking-[0.14em]"
                }
              >
                SWITCH ON
              </button>
            </form>
            <form action={setBannersEnabled}>
              <input type="hidden" name="enabled" value="0" />
              <button
                type="submit"
                className={
                  !bannersEnabled
                    ? "bg-black px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-white"
                    : "border border-black/20 px-4 py-2.5 text-xs font-semibold tracking-[0.14em]"
                }
              >
                SWITCH OFF
              </button>
            </form>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium">
          Status:{" "}
          <span className={bannersEnabled ? "text-green-700" : "text-red-700"}>
            {bannersEnabled ? "ON" : "OFF"}
          </span>
        </p>
      </section>

      <div className="grid gap-5">
        <BannerSlotField index={1} defaultUrl={banner1Url} defaultLink={banner1Link} />
        <BannerSlotField index={2} defaultUrl={banner2Url} defaultLink={banner2Link} />
        <BannerSlotField index={3} defaultUrl={banner3Url} defaultLink={banner3Link} />
      </div>
    </div>
  );
}
