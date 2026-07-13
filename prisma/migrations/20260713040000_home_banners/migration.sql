-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner1Url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner2Url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner3Url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner1Link" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner2Link" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner3Link" TEXT;
