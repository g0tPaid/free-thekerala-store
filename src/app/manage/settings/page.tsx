import { updateSettings } from "@/app/manage/actions/settings";
import { BannerSlotField } from "@/components/admin/banner-slot-field";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SettingsShape = {
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  whatsappNumber: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  currency: string;
  banner1Url?: string | null;
  banner2Url?: string | null;
  banner3Url?: string | null;
  banner1Link?: string | null;
  banner2Link?: string | null;
  banner3Link?: string | null;
};

const FALLBACK: SettingsShape = {
  siteName: "The Kerala Store",
  logoUrl: "",
  faviconUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  whatsappNumber: "",
  metaTitle: "",
  metaDescription: "",
  currency: "INR",
  banner1Url: "",
  banner2Url: "",
  banner3Url: "",
  banner1Link: "",
  banner2Link: "",
  banner3Link: "",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  let settings: SettingsShape = FALLBACK;
  try {
    settings = ((await prisma.siteSettings.findUnique({
      where: { id: "default" },
    })) ?? FALLBACK) as SettingsShape;
  } catch {
    settings = FALLBACK;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-black/45">Store</p>
        <h1 className="mt-2 text-3xl font-semibold">Settings</h1>
      </div>

      <form action={updateSettings} className="grid gap-5 border border-black/10 bg-white p-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor="siteName">
            Site name
          </label>
          <input
            id="siteName"
            name="siteName"
            defaultValue={settings.siteName}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="currency">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            defaultValue={settings.currency}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div id="banners" className="md:col-span-2 scroll-mt-24 border-t border-black/10 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Homepage banners (3)</h2>
              <p className="mt-1 text-sm text-black/55">
                Prefer the dedicated{" "}
                <a href="/manage/banners" className="font-medium text-black underline underline-offset-4">
                  Banners
                </a>{" "}
                page. Size <span className="font-medium text-black">1200 × 500 px</span> (12:5).
              </p>
            </div>
          </div>
        </div>

        <BannerSlotField index={1} defaultUrl={settings.banner1Url} defaultLink={settings.banner1Link} />
        <BannerSlotField index={2} defaultUrl={settings.banner2Url} defaultLink={settings.banner2Link} />
        <BannerSlotField index={3} defaultUrl={settings.banner3Url} defaultLink={settings.banner3Link} />

        <div>
          <label className="block text-sm font-medium" htmlFor="logoUrl">
            Logo URL
          </label>
          <input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={settings.logoUrl ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="faviconUrl">
            Favicon URL
          </label>
          <input
            id="faviconUrl"
            name="faviconUrl"
            type="url"
            defaultValue={settings.faviconUrl ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="instagramUrl">
            Instagram URL
          </label>
          <input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            defaultValue={settings.instagramUrl ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="tiktokUrl">
            TikTok URL
          </label>
          <input
            id="tiktokUrl"
            name="tiktokUrl"
            type="url"
            defaultValue={settings.tiktokUrl ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="whatsappNumber">
            WhatsApp number
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="metaTitle">
            Meta title
          </label>
          <input
            id="metaTitle"
            name="metaTitle"
            defaultValue={settings.metaTitle ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium" htmlFor="metaDescription">
            Meta description
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={4}
            defaultValue={settings.metaDescription ?? ""}
            className="mt-2 w-full border border-black/15 px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-black px-5 py-3 text-sm font-semibold text-white">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
