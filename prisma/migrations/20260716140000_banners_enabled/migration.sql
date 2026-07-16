-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "bannersEnabled" BOOLEAN NOT NULL DEFAULT true;
