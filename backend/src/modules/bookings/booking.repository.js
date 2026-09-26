const prisma = require('../../config/database');

const bookingIncludeRelations = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  workerProfile: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  workerService: true,
  serviceRequest: {
    select: {
      id: true,
      serviceName: true,
      category: true,
      description: true,
      city: true,
      area: true,
      pincode: true,
      status: true,
    },
  },
};

const createBooking = async (data) => {
  return prisma.booking.create({
    data: {
      customerId: data.customerId,
      workerProfileId: data.workerProfileId,
      workerServiceId: data.workerServiceId,
      serviceRequestId: data.serviceRequestId,
      scheduledDate: new Date(data.scheduledDate),
      scheduledTime: data.scheduledTime,
      price: data.price,
      customerNotes: data.customerNotes || null,
      status: 'PENDING',
    },
    include: bookingIncludeRelations,
  });
};

const getBookingById = async (id) => {
  return prisma.booking.findUnique({
    where: { id },
    include: bookingIncludeRelations,
  });
};

const getCustomerBookingById = async (id, customerId) => {
  return prisma.booking.findFirst({
    where: {
      id,
      customerId,
    },
    include: bookingIncludeRelations,
  });
};

const getCustomerBookings = async (customerId, filters = {}) => {
  const where = { customerId };
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.booking.findMany({
    where,
    include: bookingIncludeRelations,
    orderBy: { createdAt: 'desc' },
  });
};

const getWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: true,
        },
      },
    },
  });
};

const getWorkerBookings = async (workerProfileId, filters = {}) => {
  const where = { workerProfileId };
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.booking.findMany({
    where,
    include: bookingIncludeRelations,
    orderBy: { createdAt: 'desc' },
  });
};

const getWorkerBookingById = async (id, workerProfileId) => {
  return prisma.booking.findFirst({
    where: {
      id,
      workerProfileId,
    },
    include: bookingIncludeRelations,
  });
};

const getServiceRequestById = async (id) => {
  return prisma.serviceRequest.findUnique({
    where: { id },
  });
};

const getWorkerProfileById = async (id) => {
  return prisma.workerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });
};

const getWorkerServiceById = async (id) => {
  return prisma.workerService.findUnique({
    where: { id },
  });
};

const getMatchResult = async (serviceRequestId, workerProfileId) => {
  return prisma.matchResult.findUnique({
    where: {
      serviceRequestId_workerProfileId: {
        serviceRequestId,
        workerProfileId,
      },
    },
  });
};

const findActiveBookingByServiceRequest = async (serviceRequestId) => {
  return prisma.booking.findFirst({
    where: {
      serviceRequestId,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
  });
};

const updateBookingStatus = async (id, status, cancellationReason = null) => {
  const data = { status };
  if (cancellationReason !== undefined && cancellationReason !== null) {
    data.cancellationReason = cancellationReason;
  }

  return prisma.booking.update({
    where: { id },
    data,
    include: bookingIncludeRelations,
  });
};

const updateServiceRequestStatus = async (id, status) => {
  return prisma.serviceRequest.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createBooking,
  getBookingById,
  getCustomerBookingById,
  getCustomerBookings,
  getWorkerProfileByUserId,
  getWorkerBookings,
  getWorkerBookingById,
  getServiceRequestById,
  getWorkerProfileById,
  getWorkerServiceById,
  getMatchResult,
  findActiveBookingByServiceRequest,
  updateBookingStatus,
  updateServiceRequestStatus,
};
