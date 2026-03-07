-- Staff role, Area (network hierarchy), AuditLog

CREATE TYPE "StaffRole" AS ENUM ('OPERATOR', 'TECHNICIAN', 'BILLING_MANAGER');

ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "staff_role" "StaffRole";
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "area_id" TEXT;

CREATE TABLE IF NOT EXISTS "Area" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "parent_id" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Area_tenant_id_slug_key" ON "Area"("tenant_id", "slug");
CREATE INDEX IF NOT EXISTS "Area_tenant_id_idx" ON "Area"("tenant_id");
CREATE INDEX IF NOT EXISTS "Area_parent_id_idx" ON "Area"("parent_id");
ALTER TABLE "Area" ADD CONSTRAINT "Area_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Area" ADD CONSTRAINT "Area_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "payload" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_tenant_id_idx" ON "AuditLog"("tenant_id");
CREATE INDEX IF NOT EXISTS "AuditLog_user_id_idx" ON "AuditLog"("user_id");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_type_idx" ON "AuditLog"("entity_type");
CREATE INDEX IF NOT EXISTS "AuditLog_created_at_idx" ON "AuditLog"("created_at");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Profile_area_id_idx" ON "Profile"("area_id");
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
