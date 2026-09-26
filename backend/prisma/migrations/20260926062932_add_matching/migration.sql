-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('OPEN', 'MATCHED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "workerServiceId" TEXT,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skillMatch" BOOLEAN NOT NULL DEFAULT false,
    "serviceMatch" BOOLEAN NOT NULL DEFAULT false,
    "availabilityMatch" BOOLEAN NOT NULL DEFAULT false,
    "locationMatch" BOOLEAN NOT NULL DEFAULT false,
    "distanceKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_requests_customerId_idx" ON "service_requests"("customerId");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE INDEX "service_requests_category_idx" ON "service_requests"("category");

-- CreateIndex
CREATE INDEX "service_requests_requestedDate_idx" ON "service_requests"("requestedDate");

-- CreateIndex
CREATE INDEX "service_requests_city_idx" ON "service_requests"("city");

-- CreateIndex
CREATE INDEX "service_requests_pincode_idx" ON "service_requests"("pincode");

-- CreateIndex
CREATE INDEX "match_results_serviceRequestId_idx" ON "match_results"("serviceRequestId");

-- CreateIndex
CREATE INDEX "match_results_workerProfileId_idx" ON "match_results"("workerProfileId");

-- CreateIndex
CREATE INDEX "match_results_workerServiceId_idx" ON "match_results"("workerServiceId");

-- CreateIndex
CREATE INDEX "match_results_matchScore_idx" ON "match_results"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_serviceRequestId_workerProfileId_key" ON "match_results"("serviceRequestId", "workerProfileId");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_workerServiceId_fkey" FOREIGN KEY ("workerServiceId") REFERENCES "worker_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
