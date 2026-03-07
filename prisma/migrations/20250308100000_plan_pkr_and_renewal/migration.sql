-- PKR plans: subscription end date and receipt URL for monthly renewal

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_receipt_url" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "subscription_ends_at" TIMESTAMP(3);
