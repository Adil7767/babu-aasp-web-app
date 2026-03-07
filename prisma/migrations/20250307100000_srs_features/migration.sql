-- SRS alignment: Staff role, Customer fields, Invoices, Complaints, Notifications, Payment methods

-- Add STAFF to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';

-- Profile: customer fields and deactivate support
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "installation_date" TIMESTAMP(3);
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "router_info" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Package: validity period
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "validity_period_days" INTEGER;

-- InvoiceStatus, PaymentMethod, PaymentVerificationStatus, ComplaintCategory, ComplaintStatus, NotificationType
DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'OVERDUE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('JAZZCASH', 'EASYPAISA', 'MANUAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "ComplaintCategory" AS ENUM ('SLOW_INTERNET', 'NO_CONNECTION', 'ROUTER_ISSUE', 'BILLING_QUERY', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('BILL_DUE', 'PAYMENT_CONFIRMED', 'COMPLAINT_UPDATE', 'PACKAGE_EXPIRY', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment: new columns (add only if not exists - use conditional)
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "invoice_id" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payment_method" "PaymentMethod" DEFAULT 'MANUAL';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "verification_status" "PaymentVerificationStatus" DEFAULT 'PENDING';

-- Invoice table
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_user_id_month_year_key" ON "Invoice"("user_id", "month", "year");
CREATE INDEX IF NOT EXISTS "Invoice_user_id_idx" ON "Invoice"("user_id");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "Invoice_year_month_idx" ON "Invoice"("year", "month");
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_user_id_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_package_id_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Payment invoice_id FK
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_invoice_id_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Complaint table
CREATE TABLE IF NOT EXISTS "Complaint" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_to_id" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Complaint_user_id_idx" ON "Complaint"("user_id");
CREATE INDEX IF NOT EXISTS "Complaint_status_idx" ON "Complaint"("status");
CREATE INDEX IF NOT EXISTS "Complaint_assigned_to_id_idx" ON "Complaint"("assigned_to_id");
ALTER TABLE "Complaint" DROP CONSTRAINT IF EXISTS "Complaint_user_id_fkey";
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Complaint" DROP CONSTRAINT IF EXISTS "Complaint_assigned_to_id_fkey";
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'OTHER',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_user_id_idx" ON "Notification"("user_id");
CREATE INDEX IF NOT EXISTS "Notification_read_at_idx" ON "Notification"("read_at");
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_user_id_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
