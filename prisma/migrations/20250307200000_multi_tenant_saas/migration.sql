-- Multi-tenant SaaS: Tenant, SUPER_ADMIN, tenant_id on all tenant-scoped tables

-- Add SUPER_ADMIN to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Create TenantPlan enum
DO $$ BEGIN
  CREATE TYPE "TenantPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create Tenant table
CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "plan" "TenantPlan" NOT NULL DEFAULT 'STARTER',
  "customer_limit" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_slug_key" ON "Tenant"("slug");

-- Add tenant_id to Profile (nullable for Super Admin)
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "Profile_tenant_id_idx" ON "Profile"("tenant_id");
CREATE INDEX IF NOT EXISTS "Profile_role_idx" ON "Profile"("role");

-- Add tenant_id to Package
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "Package_tenant_id_idx" ON "Package"("tenant_id");

-- Add tenant_id to Invoice
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "Invoice_tenant_id_idx" ON "Invoice"("tenant_id");

-- Add tenant_id to Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "Payment_tenant_id_idx" ON "Payment"("tenant_id");

-- Add tenant_id to UsageRecord
ALTER TABLE "UsageRecord" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "UsageRecord_tenant_id_idx" ON "UsageRecord"("tenant_id");

-- Add tenant_id to ExpenseRecord
ALTER TABLE "ExpenseRecord" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "ExpenseRecord_tenant_id_idx" ON "ExpenseRecord"("tenant_id");

-- Add tenant_id to Complaint
ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "Complaint_tenant_id_idx" ON "Complaint"("tenant_id");

-- Add tenant_id to Notification
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
CREATE INDEX IF NOT EXISTS "Notification_tenant_id_idx" ON "Notification"("tenant_id");

-- Insert default tenant for existing data (run once; id must be a valid cuid for FKs)
INSERT INTO "Tenant" ("id", "name", "slug", "plan", "customer_limit", "is_active", "updated_at")
SELECT 'clxxdefaulttenant000000001', 'Babu ISP', 'babu-isp', 'ENTERPRISE', 0, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Tenant" LIMIT 1);

-- Backfill tenant_id for existing rows (use default tenant id)
UPDATE "Profile" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL AND "role" != 'SUPER_ADMIN';
UPDATE "Package" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;
UPDATE "Invoice" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;
UPDATE "Payment" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;
UPDATE "UsageRecord" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;
UPDATE "ExpenseRecord" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;
UPDATE "Complaint" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;
UPDATE "Notification" SET "tenant_id" = 'clxxdefaulttenant000000001' WHERE "tenant_id" IS NULL;

-- Make tenant_id NOT NULL where required (except Profile - Super Admin stays null)
ALTER TABLE "Package" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "UsageRecord" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "ExpenseRecord" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "Complaint" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Add FKs (drop if exists first to avoid duplicate)
ALTER TABLE "Profile" DROP CONSTRAINT IF EXISTS "Profile_tenant_id_fkey";
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Package" DROP CONSTRAINT IF EXISTS "Package_tenant_id_fkey";
ALTER TABLE "Package" ADD CONSTRAINT "Package_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_tenant_id_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_tenant_id_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UsageRecord" DROP CONSTRAINT IF EXISTS "UsageRecord_tenant_id_fkey";
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExpenseRecord" DROP CONSTRAINT IF EXISTS "ExpenseRecord_tenant_id_fkey";
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Complaint" DROP CONSTRAINT IF EXISTS "Complaint_tenant_id_fkey";
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_tenant_id_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Invoice unique: (tenant_id, user_id, month, year)
DROP INDEX IF EXISTS "Invoice_user_id_month_year_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_tenant_id_user_id_month_year_key" ON "Invoice"("tenant_id", "user_id", "month", "year");

-- Update UsageRecord unique: (tenant_id, user_id, month, year)
DROP INDEX IF EXISTS "UsageRecord_user_id_month_year_key";
CREATE UNIQUE INDEX IF NOT EXISTS "UsageRecord_tenant_id_user_id_month_year_key" ON "UsageRecord"("tenant_id", "user_id", "month", "year");
