/*
  Warnings:

  - The values [COOPERATIVE_ADMIN,FEDERATION_ADMIN,SUPER_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY_PROOF', 'PAN_CARD', 'ADDRESS_PROOF', 'TRADE_CERTIFICATE', 'POLICE_VERIFICATION');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'WORKER', 'ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- CreateTable
CREATE TABLE "worker_documents" (
    "id" TEXT NOT NULL,
    "workerProfileId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_documents_workerProfileId_idx" ON "worker_documents"("workerProfileId");

-- CreateIndex
CREATE INDEX "worker_documents_documentType_idx" ON "worker_documents"("documentType");

-- CreateIndex
CREATE INDEX "worker_documents_verificationStatus_idx" ON "worker_documents"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "worker_documents_workerProfileId_documentType_key" ON "worker_documents"("workerProfileId", "documentType");

-- AddForeignKey
ALTER TABLE "worker_documents" ADD CONSTRAINT "worker_documents_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
