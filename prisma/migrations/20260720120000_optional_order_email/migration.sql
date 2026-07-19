-- Allow checkout without an email address
ALTER TABLE "orders" ALTER COLUMN "email" DROP NOT NULL;
