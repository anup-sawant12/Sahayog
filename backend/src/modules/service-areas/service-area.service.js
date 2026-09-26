const serviceAreaRepository = require('./service-area.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const sortServiceAreas = (areas) => {
  return [...areas].sort((a, b) => {
    // Primary location comes first
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;

    // Then sort alphabetically by city
    const cityDiff = a.city.localeCompare(b.city);
    if (cityDiff !== 0) return cityDiff;

    // Then sort alphabetically by area
    return a.area.localeCompare(b.area);
  });
};

const getMyServiceAreas = async (userId) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceAreaRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Retrieve service areas
  const areas = await serviceAreaRepository.getServiceAreasByWorkerProfileId(profile.id);

  // 3. Sort: primary first, then city, then area
  return sortServiceAreas(areas);
};

const createServiceArea = async (userId, data) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceAreaRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Check for duplicate (city + area + pincode)
  const existing = await serviceAreaRepository.findDuplicateServiceArea(
    profile.id,
    data.city,
    data.area,
    data.pincode
  );
  if (existing) {
    throw ApiError.conflict('A service area with this city, area, and pincode already exists for your profile');
  }

  // 3. If setting as primary, clear any existing primary service areas first
  if (data.isPrimary) {
    await serviceAreaRepository.clearPrimaryServiceAreas(profile.id);
  }

  // 4. Create record
  try {
    return await serviceAreaRepository.createServiceArea(profile.id, data);
  } catch (error) {
    if (error.code === 'P2002') {
      throw ApiError.conflict('A service area with this city, area, and pincode already exists for your profile');
    }
    throw error;
  }
};

const updateServiceArea = async (userId, serviceAreaId, data) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceAreaRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find target service area
  const serviceArea = await serviceAreaRepository.getServiceAreaById(serviceAreaId);
  if (!serviceArea) {
    throw ApiError.notFound('Service area not found');
  }

  // 3. Ownership check
  if (serviceArea.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this service area');
  }

  // 4. Check for duplicate if city, area, or pincode is changing
  const effectiveCity = data.city !== undefined ? data.city : serviceArea.city;
  const effectiveArea = data.area !== undefined ? data.area : serviceArea.area;
  const effectivePincode = data.pincode !== undefined ? data.pincode : serviceArea.pincode;

  const duplicate = await serviceAreaRepository.findDuplicateServiceArea(
    profile.id,
    effectiveCity,
    effectiveArea,
    effectivePincode,
    serviceAreaId
  );
  if (duplicate) {
    throw ApiError.conflict('A service area with this city, area, and pincode already exists for your profile');
  }

  // 5. If setting as primary, make all other service areas for this worker non-primary
  if (data.isPrimary === true) {
    await serviceAreaRepository.clearPrimaryServiceAreas(profile.id);
  }

  // 6. Update record
  try {
    return await serviceAreaRepository.updateServiceArea(serviceAreaId, data);
  } catch (error) {
    if (error.code === 'P2002') {
      throw ApiError.conflict('A service area with this city, area, and pincode already exists for your profile');
    }
    throw error;
  }
};

const deleteServiceArea = async (userId, serviceAreaId) => {
  // 1. Find WorkerProfile using userId
  const profile = await serviceAreaRepository.getWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find target service area
  const serviceArea = await serviceAreaRepository.getServiceAreaById(serviceAreaId);
  if (!serviceArea) {
    throw ApiError.notFound('Service area not found');
  }

  // 3. Ownership check
  if (serviceArea.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied. You do not own this service area');
  }

  // 4. Delete record
  await serviceAreaRepository.deleteServiceArea(serviceAreaId);

  return true;
};

module.exports = {
  getMyServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};
