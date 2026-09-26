const prisma = require('../../config/database');

const createServiceRequest = async (data) => {
  return prisma.serviceRequest.create({
    data: {
      customerId: data.customerId,
      serviceName: data.serviceName,
      category: data.category,
      description: data.description !== undefined ? data.description : null,
      requestedDate: new Date(data.requestedDate),
      requestedTime: data.requestedTime,
      city: data.city,
      area: data.area,
      pincode: data.pincode,
      latitude: data.latitude !== undefined ? data.latitude : null,
      longitude: data.longitude !== undefined ? data.longitude : null,
      status: 'OPEN',
    },
  });
};

const getServiceRequestById = async (id) => {
  return prisma.serviceRequest.findUnique({
    where: { id },
  });
};

const getCustomerServiceRequestById = async (customerId, id) => {
  return prisma.serviceRequest.findFirst({
    where: {
      id,
      customerId,
    },
  });
};

const findEligibleWorkers = async (requestData) => {
  return prisma.workerProfile.findMany({
    where: {
      verificationStatus: 'APPROVED',
      user: {
        status: 'ACTIVE',
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      workerSkills: {
        include: {
          skill: true,
        },
      },
      workerServices: {
        where: {
          status: 'ACTIVE',
        },
      },
      workerAvailability: {
        where: {
          isAvailable: true,
        },
      },
      serviceAreas: true,
    },
  });
};

const createMatchResults = async (results) => {
  if (!results || results.length === 0) return [];

  return prisma.matchResult.createMany({
    data: results.map((r) => ({
      serviceRequestId: r.serviceRequestId,
      workerProfileId: r.workerProfileId,
      workerServiceId: r.workerServiceId || null,
      matchScore: r.matchScore,
      skillMatch: r.skillMatch,
      serviceMatch: r.serviceMatch,
      availabilityMatch: r.availabilityMatch,
      locationMatch: r.locationMatch,
      distanceKm: r.distanceKm !== undefined && r.distanceKm !== null ? r.distanceKm : null,
    })),
  });
};

const getMatchResultsByRequestId = async (serviceRequestId) => {
  return prisma.matchResult.findMany({
    where: { serviceRequestId },
    include: {
      workerProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      workerService: true,
    },
    orderBy: [
      { matchScore: 'desc' },
      { distanceKm: 'asc' },
    ],
  });
};

const clearMatchResults = async (serviceRequestId) => {
  return prisma.matchResult.deleteMany({
    where: { serviceRequestId },
  });
};

const updateServiceRequestStatus = async (id, status) => {
  return prisma.serviceRequest.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createServiceRequest,
  getServiceRequestById,
  getCustomerServiceRequestById,
  findEligibleWorkers,
  createMatchResults,
  getMatchResultsByRequestId,
  clearMatchResults,
  updateServiceRequestStatus,
};
