-- Tenant subscription: signup flow and manual payment to Super Admin

CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED');

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_payment_method" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_payment_reference" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_amount" DECIMAL(10,2);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_requested_at" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_approved_at" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "approved_by_id" TEXT;

ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
