const prisma = require('../../config/database');

const safeServiceAreaSelect = {
  id: true,
  city: true,
  area: true,
  pincode: true,
  latitude: true,
  longitude: true,
  serviceRadiusKm: true,
  isPrimary: true,
  createdAt: true,
  updatedAt: true,
};

const getWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });
};

const getServiceAreasByWorkerProfileId = async (workerProfileId) => {
  return prisma.workerServiceArea.findMany({
    where: { workerProfileId },
    select: safeServiceAreaSelect,
  });
};

const getServiceAreaById = async (id) => {
  return prisma.workerServiceArea.findUnique({
    where: { id },
    select: {
      ...safeServiceAreaSelect,
      workerProfileId: true,
    },
  });
};

const findDuplicateServiceArea = async (workerProfileId, city, area, pincode, excludeId = null) => {
  const where = {
    workerProfileId,
    city,
    area,
    pincode,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return prisma.workerServiceArea.findFirst({
    where,
    select: { id: true },
  });
};

const clearPrimaryServiceAreas = async (workerProfileId) => {
  return prisma.workerServiceArea.updateMany({
    where: {
      workerProfileId,
      isPrimary: true,
    },
    data: {
      isPrimary: false,
    },
  });
};

const createServiceArea = async (workerProfileId, data) => {
  return prisma.workerServiceArea.create({
    data: {
      workerProfileId,
      city: data.city,
      area: data.area,
      pincode: data.pincode,
      latitude: data.latitude !== undefined ? data.latitude : null,
      longitude: data.longitude !== undefined ? data.longitude : null,
      serviceRadiusKm: data.serviceRadiusKm !== undefined ? data.serviceRadiusKm : 10,
      isPrimary: data.isPrimary !== undefined ? data.isPrimary : false,
    },
    select: safeServiceAreaSelect,
  });
};

const updateServiceArea = async (id, data) => {
  const updateData = {};
  if (data.city !== undefined) updateData.city = data.city;
  if (data.area !== undefined) updateData.area = data.area;
  if (data.pincode !== undefined) updateData.pincode = data.pincode;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.serviceRadiusKm !== undefined) updateData.serviceRadiusKm = data.serviceRadiusKm;
  if (data.isPrimary !== undefined) updateData.isPrimary = data.isPrimary;

  return prisma.workerServiceArea.update({
    where: { id },
    data: updateData,
    select: safeServiceAreaSelect,
  });
};

const deleteServiceArea = async (id) => {
  return prisma.workerServiceArea.delete({
    where: { id },
  });
};

module.exports = {
  getWorkerProfileByUserId,
  getServiceAreasByWorkerProfileId,
  getServiceAreaById,
  findDuplicateServiceArea,
  clearPrimaryServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};
