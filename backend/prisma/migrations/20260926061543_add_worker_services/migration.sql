-- CreateEnum
CREATE TYPE "ServicePricingUnit" AS ENUM ('FIXED', 'HOURLY', 'DAILY');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "worker_services" (
    "id" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "pricingUnit" "ServicePricingUnit" NOT NULL DEFAULT 'FIXED',
    "durationMinutes" INTEGER,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_services_workerProfileId_idx" ON "worker_services"("workerProfileId");

-- CreateIndex
CREATE INDEX "worker_services_category_idx" ON "worker_services"("category");

-- CreateIndex
CREATE INDEX "worker_services_status_idx" ON "worker_services"("status");

-- AddForeignKey
ALTER TABLE "worker_services" ADD CONSTRAINT "worker_services_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
