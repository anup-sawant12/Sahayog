-- CreateTable
CREATE TABLE "worker_service_areas" (
    "id" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "serviceRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_service_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_service_areas_workerProfileId_idx" ON "worker_service_areas"("workerProfileId");

-- CreateIndex
CREATE INDEX "worker_service_areas_city_idx" ON "worker_service_areas"("city");

-- CreateIndex
CREATE INDEX "worker_service_areas_pincode_idx" ON "worker_service_areas"("pincode");

-- CreateIndex
CREATE UNIQUE INDEX "worker_service_areas_workerProfileId_city_area_pincode_key" ON "worker_service_areas"("workerProfileId", "city", "area", "pincode");

-- AddForeignKey
ALTER TABLE "worker_service_areas" ADD CONSTRAINT "worker_service_areas_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
