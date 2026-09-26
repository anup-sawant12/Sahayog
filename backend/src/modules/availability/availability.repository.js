const prisma = require('../../config/database');

const safeAvailabilitySelect = {
  id: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
  createdAt: true,
  updatedAt: true,
};

const getWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });
};

const getAvailabilityByWorkerProfileId = async (workerProfileId) => {
  return prisma.workerAvailability.findMany({
    where: { workerProfileId },
    select: safeAvailabilitySelect,
  });
};

const getAvailabilityById = async (id) => {
  return prisma.workerAvailability.findUnique({
    where: { id },
    select: {
      ...safeAvailabilitySelect,
      workerProfileId: true,
    },
  });
};

const findDuplicateAvailability = async (workerProfileId, dayOfWeek, startTime, endTime, excludeId = null) => {
  const where = {
    workerProfileId,
    dayOfWeek,
    startTime,
    endTime,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return prisma.workerAvailability.findFirst({
    where,
    select: { id: true },
  });
};

const createAvailability = async (workerProfileId, data) => {
  return prisma.workerAvailability.create({
    data: {
      workerProfileId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
    },
    select: safeAvailabilitySelect,
  });
};

const updateAvailability = async (id, data) => {
  const updateData = {};
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
  if (data.startTime !== undefined) updateData.startTime = data.startTime;
  if (data.endTime !== undefined) updateData.endTime = data.endTime;
  if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

  return prisma.workerAvailability.update({
    where: { id },
    data: updateData,
    select: safeAvailabilitySelect,
  });
};

const deleteAvailability = async (id) => {
  return prisma.workerAvailability.delete({
    where: { id },
  });
};

module.exports = {
  getWorkerProfileByUserId,
  getAvailabilityByWorkerProfileId,
  getAvailabilityById,
  findDuplicateAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
