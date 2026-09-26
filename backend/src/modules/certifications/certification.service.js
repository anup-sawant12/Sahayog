const certificationRepository = require('./certification.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const getMyCertifications = async (userId) => {
  // 1. Find worker profile using authenticated userId
  const profile = await certificationRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Return all certifications belonging to that worker
  return certificationRepository.getCertificationsByWorkerProfileId(profile.id);
};

const createCertification = async (userId, data) => {
  // 1. Find worker profile using authenticated userId
  const profile = await certificationRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Create certification for the worker profile
  return certificationRepository.createCertification(profile.id, data);
};

const updateCertification = async (userId, certificationId, data) => {
  // 1. Find worker profile using authenticated userId
  const profile = await certificationRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find certification by ID
  const certification = await certificationRepository.getCertificationById(certificationId);
  if (!certification) {
    throw ApiError.notFound('Certification not found');
  }

  // 3. Verify certification belongs to the authenticated worker
  if (certification.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this certification');
  }

  // 4. Validate cross-field dates between updated and existing values
  const effectiveIssueDate = data.issueDate ? new Date(data.issueDate) : new Date(certification.issueDate);
  const effectiveExpiryDate =
    data.expiryDate !== undefined
      ? data.expiryDate ? new Date(data.expiryDate) : null
      : certification.expiryDate ? new Date(certification.expiryDate) : null;

  if (effectiveExpiryDate && effectiveIssueDate && effectiveExpiryDate < effectiveIssueDate) {
    throw ApiError.badRequest('expiryDate cannot be earlier than issueDate');
  }

  // 5. Update certification
  return certificationRepository.updateCertification(certificationId, data);
};

const deleteCertification = async (userId, certificationId) => {
  // 1. Find worker profile using authenticated userId
  const profile = await certificationRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find certification by ID
  const certification = await certificationRepository.getCertificationById(certificationId);
  if (!certification) {
    throw ApiError.notFound('Certification not found');
  }

  // 3. Verify certification belongs to the authenticated worker
  if (certification.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this certification');
  }

  // 4. Delete certification
  await certificationRepository.deleteCertification(certificationId);

  return true;
};

module.exports = {
  getMyCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
};
