-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "worker_availability" (
    "id" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_availability_workerProfileId_idx" ON "worker_availability"("workerProfileId");

-- CreateIndex
CREATE INDEX "worker_availability_dayOfWeek_idx" ON "worker_availability"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "worker_availability_workerProfileId_dayOfWeek_startTime_end_key" ON "worker_availability"("workerProfileId", "dayOfWeek", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
