const bookingRepository = require('./booking.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const formatBooking = (booking) => {
  if (!booking) return null;

  return {
    id: booking.id,
    customerId: booking.customerId,
    workerProfileId: booking.workerProfileId,
    workerServiceId: booking.workerServiceId,
    serviceRequestId: booking.serviceRequestId,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    price: booking.price !== null && booking.price !== undefined ? Number(booking.price) : null,
    customerNotes: booking.customerNotes,
    status: booking.status,
    cancellationReason: booking.cancellationReason,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    customer: booking.customer
      ? {
          id: booking.customer.id,
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone,
        }
      : undefined,
    worker: booking.workerProfile
      ? {
          id: booking.workerProfile.id,
          name: booking.workerProfile.user?.name || null,
          email: booking.workerProfile.user?.email || null,
          phone: booking.workerProfile.user?.phone || null,
          profilePhotoUrl: booking.workerProfile.profilePhotoUrl || null,
          experienceYears: booking.workerProfile.experienceYears || null,
          verificationStatus: booking.workerProfile.verificationStatus || null,
        }
      : undefined,
    workerService: booking.workerService
      ? {
          id: booking.workerService.id,
          name: booking.workerService.name,
          category: booking.workerService.category,
          description: booking.workerService.description,
          price: Number(booking.workerService.price),
          pricingUnit: booking.workerService.pricingUnit,
          durationMinutes: booking.workerService.durationMinutes,
        }
      : undefined,
    serviceRequest: booking.serviceRequest
      ? {
          id: booking.serviceRequest.id,
          serviceName: booking.serviceRequest.serviceName,
          category: booking.serviceRequest.category,
          description: booking.serviceRequest.description,
          city: booking.serviceRequest.city,
          area: booking.serviceRequest.area,
          pincode: booking.serviceRequest.pincode,
          status: booking.serviceRequest.status,
        }
      : undefined,
  };
};

const createBooking = async (customerId, data) => {
  // 1. Verify service request exists
  const serviceRequest = await bookingRepository.getServiceRequestById(data.serviceRequestId);
  if (!serviceRequest) {
    throw ApiError.notFound('Service request not found');
  }

  // 2. Verify service request belongs to authenticated customer
  if (serviceRequest.customerId !== customerId) {
    throw ApiError.notFound('Service request not found');
  }

  // 3. Verify service request status is OPEN or MATCHED
  if (serviceRequest.status !== 'OPEN' && serviceRequest.status !== 'MATCHED') {
    throw ApiError.conflict(`Cannot book service request with status ${serviceRequest.status}`);
  }

  // 4. Verify worker profile exists
  const workerProfile = await bookingRepository.getWorkerProfileById(data.workerProfileId);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 5. Verify worker profile belongs to a WORKER user
  if (workerProfile.user?.role !== 'WORKER') {
    throw ApiError.badRequest('Selected profile is not a valid worker');
  }

  // 6. Verify worker verification status is APPROVED
  if (workerProfile.verificationStatus !== 'APPROVED') {
    throw ApiError.badRequest('Worker profile is not approved for bookings');
  }

  // 7. Verify worker service exists
  const workerService = await bookingRepository.getWorkerServiceById(data.workerServiceId);
  if (!workerService) {
    throw ApiError.notFound('Worker service not found');
  }

  // 8. Verify worker service belongs to selected worker profile
  if (workerService.workerProfileId !== data.workerProfileId) {
    throw ApiError.badRequest('Selected service does not belong to this worker');
  }

  // 9. Verify worker service status is ACTIVE
  if (workerService.status !== 'ACTIVE') {
    throw ApiError.badRequest('Worker service is not currently active');
  }

  // 10. Verify worker is matched to the service request
  const matchResult = await bookingRepository.getMatchResult(data.serviceRequestId, data.workerProfileId);
  if (!matchResult) {
    throw ApiError.badRequest('Worker has not been matched with this service request');
  }

  // 11. If matchResult contains a workerServiceId, ensure it matches selected workerServiceId
  if (matchResult.workerServiceId && matchResult.workerServiceId !== data.workerServiceId) {
    throw ApiError.badRequest('Selected worker service does not match the recommended match');
  }

  // 12. Prevent duplicate active bookings for the same service request
  const existingActive = await bookingRepository.findActiveBookingByServiceRequest(data.serviceRequestId);
  if (existingActive) {
    throw ApiError.conflict('An active booking already exists for this service request');
  }

  // 13. Price is always taken authoritatively from WorkerService.price
  const price = workerService.price;

  // 14. Create booking
  const booking = await bookingRepository.createBooking({
    customerId,
    workerProfileId: data.workerProfileId,
    workerServiceId: data.workerServiceId,
    serviceRequestId: data.serviceRequestId,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
    price,
    customerNotes: data.customerNotes,
  });

  // 15. Update service request status to MATCHED if it was OPEN
  if (serviceRequest.status === 'OPEN') {
    await bookingRepository.updateServiceRequestStatus(serviceRequest.id, 'MATCHED');
  }

  return formatBooking(booking);
};

const getCustomerBookings = async (customerId, filters = {}) => {
  const bookings = await bookingRepository.getCustomerBookings(customerId, filters);
  return bookings.map(formatBooking);
};

const getCustomerBooking = async (customerId, bookingId) => {
  const booking = await bookingRepository.getCustomerBookingById(bookingId, customerId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  return formatBooking(booking);
};

const cancelBooking = async (customerId, bookingId, cancellationReason) => {
  const booking = await bookingRepository.getCustomerBookingById(bookingId, customerId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Allowed current statuses: PENDING, CONFIRMED
  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    throw ApiError.conflict(`Cannot cancel booking with status ${booking.status}`);
  }

  const updatedBooking = await bookingRepository.updateBookingStatus(
    bookingId,
    'CANCELLED',
    cancellationReason || 'Cancelled by customer'
  );

  return formatBooking(updatedBooking);
};

const getWorkerBookings = async (userId, filters = {}) => {
  const workerProfile = await bookingRepository.getWorkerProfileByUserId(userId);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const bookings = await bookingRepository.getWorkerBookings(workerProfile.id, filters);
  return bookings.map(formatBooking);
};

const getWorkerBooking = async (userId, bookingId) => {
  const workerProfile = await bookingRepository.getWorkerProfileByUserId(userId);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const booking = await bookingRepository.getWorkerBookingById(bookingId, workerProfile.id);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  return formatBooking(booking);
};

const acceptBooking = async (userId, bookingId) => {
  const workerProfile = await bookingRepository.getWorkerProfileByUserId(userId);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const booking = await bookingRepository.getWorkerBookingById(bookingId, workerProfile.id);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.status === 'CONFIRMED') {
    throw ApiError.conflict('Booking is already confirmed');
  }

  if (booking.status !== 'PENDING') {
    throw ApiError.conflict(`Cannot accept booking with status ${booking.status}`);
  }

  const updatedBooking = await bookingRepository.updateBookingStatus(bookingId, 'CONFIRMED');
  return formatBooking(updatedBooking);
};

const rejectBooking = async (userId, bookingId, cancellationReason) => {
  const workerProfile = await bookingRepository.getWorkerProfileByUserId(userId);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const booking = await bookingRepository.getWorkerBookingById(bookingId, workerProfile.id);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.status !== 'PENDING') {
    throw ApiError.conflict(`Cannot reject booking with status ${booking.status}`);
  }

  const updatedBooking = await bookingRepository.updateBookingStatus(
    bookingId,
    'REJECTED',
    cancellationReason || 'Rejected by worker'
  );

  return formatBooking(updatedBooking);
};

const completeBooking = async (userId, bookingId) => {
  const workerProfile = await bookingRepository.getWorkerProfileByUserId(userId);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const booking = await bookingRepository.getWorkerBookingById(bookingId, workerProfile.id);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.status !== 'CONFIRMED') {
    throw ApiError.conflict(`Cannot complete booking with status ${booking.status}. Booking must be CONFIRMED.`);
  }

  const updatedBooking = await bookingRepository.updateBookingStatus(bookingId, 'COMPLETED');

  // Also update associated ServiceRequest to COMPLETED
  if (booking.serviceRequestId) {
    try {
      await bookingRepository.updateServiceRequestStatus(booking.serviceRequestId, 'COMPLETED');
    } catch {
      // Ignore if service request is already updated or not found
    }
  }

  return formatBooking(updatedBooking);
};

module.exports = {
  formatBooking,
  createBooking,
  getCustomerBookings,
  getCustomerBooking,
  cancelBooking,
  getWorkerBookings,
  getWorkerBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
};
