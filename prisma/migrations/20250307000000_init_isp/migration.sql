-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('DATA', 'CABLE');

-- CreateEnum
CREATE TYPE "UserPackageStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PackageType" NOT NULL DEFAULT 'DATA',
    "mb_limit" INTEGER,
    "speed_mbps" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPackage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "status" "UserPackageStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "mb_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseRecord" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_user_id_month_year_key" ON "UsageRecord"("user_id", "month", "year");

-- CreateIndex
CREATE INDEX "UserPackage_user_id_idx" ON "UserPackage"("user_id");

-- CreateIndex
CREATE INDEX "UserPackage_package_id_idx" ON "UserPackage"("package_id");

-- CreateIndex
CREATE INDEX "UserPackage_status_idx" ON "UserPackage"("status");

-- CreateIndex
CREATE INDEX "Payment_user_id_idx" ON "Payment"("user_id");

-- CreateIndex
CREATE INDEX "Payment_year_month_idx" ON "Payment"("year", "month");

-- CreateIndex
CREATE INDEX "UsageRecord_user_id_idx" ON "UsageRecord"("user_id");

-- CreateIndex
CREATE INDEX "ExpenseRecord_year_month_idx" ON "ExpenseRecord"("year", "month");

-- AddForeignKey
ALTER TABLE "UserPackage" ADD CONSTRAINT "UserPackage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPackage" ADD CONSTRAINT "UserPackage_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
