const prisma = require('../../config/database');

const safeServiceSelect = {
  id: true,
  name: true,
  category: true,
  description: true,
  price: true,
  pricingUnit: true,
  durationMinutes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const getWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true, userId: true },
  });
};

const getServicesByWorkerProfileId = async (workerProfileId) => {
  return prisma.workerService.findMany({
    where: { workerProfileId },
    select: safeServiceSelect,
    orderBy: [
      { status: 'asc' }, // ACTIVE first, then INACTIVE
      { category: 'asc' },
      { name: 'asc' },
    ],
  });
};

const getServiceById = async (id) => {
  return prisma.workerService.findUnique({
    where: { id },
    select: {
      ...safeServiceSelect,
      workerProfileId: true,
    },
  });
};

const createService = async (workerProfileId, data) => {
  return prisma.workerService.create({
    data: {
      workerProfileId,
      name: data.name,
      category: data.category,
      description: data.description !== undefined ? data.description : null,
      price: data.price,
      pricingUnit: data.pricingUnit || 'FIXED',
      durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : null,
      status: data.status || 'ACTIVE',
    },
    select: safeServiceSelect,
  });
};

const updateService = async (id, data) => {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.pricingUnit !== undefined) updateData.pricingUnit = data.pricingUnit;
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.workerService.update({
    where: { id },
    data: updateData,
    select: safeServiceSelect,
  });
};

const deleteService = async (id) => {
  return prisma.workerService.delete({
    where: { id },
  });
};

module.exports = {
  safeServiceSelect,
  getWorkerProfileByUserId,
  getServicesByWorkerProfileId,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
