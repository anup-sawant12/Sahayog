-- CreateEnum
CREATE TYPE "CertificationVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "worker_certifications" (
    "id" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "certificateNumber" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "verificationStatus" "CertificationVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_certifications_workerProfileId_idx" ON "worker_certifications"("workerProfileId");

-- CreateIndex
CREATE INDEX "worker_certifications_verificationStatus_idx" ON "worker_certifications"("verificationStatus");

-- AddForeignKey
ALTER TABLE "worker_certifications" ADD CONSTRAINT "worker_certifications_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
