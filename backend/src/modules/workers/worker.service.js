const workerRepository = require('./worker.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const createWorkerProfile = async (userId, data) => {
  // 1. Check whether the worker profile already exists
  const existingProfile = await workerRepository.findWorkerProfileByUserId(userId);
  if (existingProfile) {
    throw ApiError.conflict('Worker profile already exists');
  }

  // 2. Create the worker profile with default PENDING verificationStatus
  const profile = await workerRepository.createWorkerProfile(userId, data);

  return profile;
};

const getWorkerProfile = async (userId) => {
  // 1. Find the worker profile using userId
  const profile = await workerRepository.findWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  return profile;
};

const updateWorkerProfile = async (userId, data) => {
  // 1. Ensure the worker profile exists
  const existingProfile = await workerRepository.findWorkerProfileByUserId(userId);
  if (!existingProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Update allowed fields only
  const updatedProfile = await workerRepository.updateWorkerProfile(userId, data);

  return updatedProfile;
};

module.exports = {
  createWorkerProfile,
  getWorkerProfile,
  updateWorkerProfile,
};
