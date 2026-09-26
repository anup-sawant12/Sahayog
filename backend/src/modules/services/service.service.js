const serviceRepository = require('./service.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const formatService = (service) => {
  if (!service) return null;
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    price: service.price !== null && service.price !== undefined ? Number(service.price) : 0,
    pricingUnit: service.pricingUnit,
    durationMinutes: service.durationMinutes,
    status: service.status,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
};

const sortServices = (services) => {
  return [...services].sort((a, b) => {
    // ACTIVE services first
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;

    // Then sort alphabetically by category
    const catDiff = a.category.localeCompare(b.category);
    if (catDiff !== 0) return catDiff;

    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

const getMyServices = async (userId) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Retrieve services
  const rawServices = await serviceRepository.getServicesByWorkerProfileId(profile.id);

  // 3. Format and sort (ACTIVE first, then category, then name)
  const formattedServices = rawServices.map(formatService);
  return sortServices(formattedServices);
};

const createService = async (userId, data) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Create service
  const newService = await serviceRepository.createService(profile.id, data);

  // 3. Return clean formatted result
  return formatService(newService);
};

const updateService = async (userId, serviceId, data) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find target service
  const service = await serviceRepository.getServiceById(serviceId);
  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  // 3. Prevent cross-worker access (verify ownership)
  if (service.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this service');
  }

  // 4. Update service
  const updatedService = await serviceRepository.updateService(serviceId, data);

  // 5. Return clean formatted result
  return formatService(updatedService);
};

const deleteService = async (userId, serviceId) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find target service
  const service = await serviceRepository.getServiceById(serviceId);
  if (!service) {
    throw ApiError.notFound('Service not found');
  }

  // 3. Prevent cross-worker access (verify ownership)
  if (service.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this service');
  }

  // 4. Delete service
  await serviceRepository.deleteService(serviceId);
  return null;
};

module.exports = {
  formatService,
  sortServices,
  getMyServices,
  createService,
  updateService,
  deleteService,
};
