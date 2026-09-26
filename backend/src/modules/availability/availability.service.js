const availabilityRepository = require('./availability.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const DAY_ORDER = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const sortWeeklyAvailability = (items) => {
  return [...items].sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
};

const getMyAvailability = async (userId) => {
  // 1. Find worker profile using userId
  const profile = await availabilityRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Retrieve records
  const records = await availabilityRepository.getAvailabilityByWorkerProfileId(profile.id);

  // 3. Sort in logical weekly order (Monday-Sunday, then startTime asc)
  return sortWeeklyAvailability(records);
};

const createAvailability = async (userId, data) => {
  // 1. Find worker profile using userId
  const profile = await availabilityRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Check for duplicate slot
  const duplicate = await availabilityRepository.findDuplicateAvailability(
    profile.id,
    data.dayOfWeek,
    data.startTime,
    data.endTime
  );
  if (duplicate) {
    throw ApiError.conflict('An availability slot with the same day, start time, and end time already exists');
  }

  // 3. Create record
  try {
    return await availabilityRepository.createAvailability(profile.id, data);
  } catch (error) {
    if (error.code === 'P2002') {
      throw ApiError.conflict('An availability slot with the same day, start time, and end time already exists');
    }
    throw error;
  }
};

const updateAvailability = async (userId, availabilityId, data) => {
  // 1. Find worker profile using userId
  const profile = await availabilityRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find target availability slot
  const availability = await availabilityRepository.getAvailabilityById(availabilityId);
  if (!availability) {
    throw ApiError.notFound('Availability slot not found');
  }

  // 3. Enforce ownership
  if (availability.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this availability slot');
  }

  // 4. Validate cross-field times if one or both are being updated
  const effectiveStartTime = data.startTime !== undefined ? data.startTime : availability.startTime;
  const effectiveEndTime = data.endTime !== undefined ? data.endTime : availability.endTime;

  if (effectiveStartTime >= effectiveEndTime) {
    throw ApiError.badRequest('startTime must be earlier than endTime');
  }

  // 5. Check for duplicate conflict if day/times are changing
  const effectiveDay = data.dayOfWeek !== undefined ? data.dayOfWeek : availability.dayOfWeek;
  const duplicate = await availabilityRepository.findDuplicateAvailability(
    profile.id,
    effectiveDay,
    effectiveStartTime,
    effectiveEndTime,
    availabilityId
  );
  if (duplicate) {
    throw ApiError.conflict('An availability slot with the same day, start time, and end time already exists');
  }

  // 6. Update record
  try {
    return await availabilityRepository.updateAvailability(availabilityId, data);
  } catch (error) {
    if (error.code === 'P2002') {
      throw ApiError.conflict('An availability slot with the same day, start time, and end time already exists');
    }
    throw error;
  }
};

const deleteAvailability = async (userId, availabilityId) => {
  // 1. Find worker profile using userId
  const profile = await availabilityRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find target availability slot
  const availability = await availabilityRepository.getAvailabilityById(availabilityId);
  if (!availability) {
    throw ApiError.notFound('Availability slot not found');
  }

  // 3. Enforce ownership
  if (availability.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this availability slot');
  }

  // 4. Delete record
  await availabilityRepository.deleteAvailability(availabilityId);

  return true;
};

module.exports = {
  getMyAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
