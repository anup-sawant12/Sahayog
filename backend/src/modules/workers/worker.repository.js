const prisma = require('../../config/database');

const safeWorkerProfileSelect = {
  id: true,
  userId: true,
  bio: true,
  experienceYears: true,
  profilePhotoUrl: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
};

const findWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: safeWorkerProfileSelect,
  });
};

const createWorkerProfile = async (userId, data) => {
  const profileData = {
    userId,
    verificationStatus: 'PENDING',
  };

  if (data.bio !== undefined) profileData.bio = data.bio ? data.bio.trim() : null;
  if (data.experienceYears !== undefined) profileData.experienceYears = data.experienceYears;
  if (data.profilePhotoUrl !== undefined) profileData.profilePhotoUrl = data.profilePhotoUrl ? data.profilePhotoUrl.trim() : null;

  return prisma.workerProfile.create({
    data: profileData,
    select: safeWorkerProfileSelect,
  });
};

const updateWorkerProfile = async (userId, data) => {
  const allowedData = {};

  if (data.bio !== undefined) allowedData.bio = data.bio ? data.bio.trim() : null;
  if (data.experienceYears !== undefined) allowedData.experienceYears = data.experienceYears;
  if (data.profilePhotoUrl !== undefined) allowedData.profilePhotoUrl = data.profilePhotoUrl ? data.profilePhotoUrl.trim() : null;

  return prisma.workerProfile.update({
    where: { userId },
    data: allowedData,
    select: safeWorkerProfileSelect,
  });
};

module.exports = {
  findWorkerProfileByUserId,
  createWorkerProfile,
  updateWorkerProfile,
};
