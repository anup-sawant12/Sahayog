const prisma = require('../../config/database');

const safeCertificationSelect = {
  id: true,
  name: true,
  issuingOrganization: true,
  certificateNumber: true,
  issueDate: true,
  expiryDate: true,
  documentUrl: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
};

const getWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });
};

const getCertificationsByWorkerProfileId = async (workerProfileId) => {
  return prisma.workerCertification.findMany({
    where: { workerProfileId },
    select: safeCertificationSelect,
    orderBy: { createdAt: 'desc' },
  });
};

const getCertificationById = async (certificationId) => {
  return prisma.workerCertification.findUnique({
    where: { id: certificationId },
    select: {
      ...safeCertificationSelect,
      workerProfileId: true,
    },
  });
};

const createCertification = async (workerProfileId, data) => {
  return prisma.workerCertification.create({
    data: {
      workerProfileId,
      name: data.name,
      issuingOrganization: data.issuingOrganization,
      certificateNumber: data.certificateNumber || null,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate || null,
      documentUrl: data.documentUrl || null,
      verificationStatus: 'PENDING',
    },
    select: safeCertificationSelect,
  });
};

const updateCertification = async (certificationId, data) => {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.issuingOrganization !== undefined) updateData.issuingOrganization = data.issuingOrganization;
  if (data.certificateNumber !== undefined) updateData.certificateNumber = data.certificateNumber || null;
  if (data.issueDate !== undefined) updateData.issueDate = data.issueDate;
  if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate || null;
  if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl || null;

  return prisma.workerCertification.update({
    where: { id: certificationId },
    data: updateData,
    select: safeCertificationSelect,
  });
};

const deleteCertification = async (certificationId) => {
  return prisma.workerCertification.delete({
    where: { id: certificationId },
  });
};

module.exports = {
  getWorkerProfileByUserId,
  getCertificationsByWorkerProfileId,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
};
