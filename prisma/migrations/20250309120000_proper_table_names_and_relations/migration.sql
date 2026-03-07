-- Rename tables to snake_case plural; add AuditLog FK to Profile
ALTER TABLE "Tenant" RENAME TO "tenants";
ALTER TABLE "Profile" RENAME TO "profiles";
ALTER TABLE "PasswordResetToken" RENAME TO "password_reset_tokens";
ALTER TABLE "Package" RENAME TO "packages";
ALTER TABLE "UserPackage" RENAME TO "user_packages";
ALTER TABLE "Invoice" RENAME TO "invoices";
ALTER TABLE "Payment" RENAME TO "payments";
ALTER TABLE "UsageRecord" RENAME TO "usage_records";
ALTER TABLE "ExpenseRecord" RENAME TO "expense_records";
ALTER TABLE "Complaint" RENAME TO "complaints";
ALTER TABLE "Notification" RENAME TO "notifications";
ALTER TABLE "Area" RENAME TO "areas";
ALTER TABLE "AuditLog" RENAME TO "audit_logs";

ALTER TABLE "audit_logs" ALTER COLUMN "user_id" DROP NOT NULL;
DO $$ BEGIN
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "packages_is_active_idx" ON "packages"("is_active");
CREATE INDEX IF NOT EXISTS "user_packages_user_id_status_idx" ON "user_packages"("user_id", "status");
CREATE INDEX IF NOT EXISTS "payments_tenant_id_year_idx" ON "payments"("tenant_id", "year");
CREATE INDEX IF NOT EXISTS "usage_records_tenant_id_year_month_idx" ON "usage_records"("tenant_id", "year", "month");
CREATE INDEX IF NOT EXISTS "expense_records_created_by_id_idx" ON "expense_records"("created_by_id");
CREATE INDEX IF NOT EXISTS "complaints_tenant_id_status_idx" ON "complaints"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");
