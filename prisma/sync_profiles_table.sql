-- Run if profiles table exists but is missing columns (e.g. after clone or different DB).
-- Usage: npx prisma db execute --file prisma/sync_profiles_table.sql --schema=./prisma/schema.prisma

DO $$ BEGIN
  CREATE TYPE "StaffRole" AS ENUM ('OPERATOR', 'TECHNICIAN', 'BILLING_MANAGER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_role "StaffRole";
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS area_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS installation_date TIMESTAMP(3);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS router_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS profiles_tenant_id_idx ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_area_id_idx ON profiles(area_id);
