const notificationRepository = require('./notification.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const getUserNotifications = async (userId, query = {}) => {
  const { skip, take } = query;
  return notificationRepository.getUserNotifications(userId, { skip, take });
};

const getUnreadCount = async (userId) => {
  const count = await notificationRepository.getUnreadCount(userId);
  return { unreadCount: count };
};

const markAsRead = async (userId, notificationId) => {
  const existing = await notificationRepository.getNotificationById(notificationId, userId);
  if (!existing) {
    throw ApiError.notFound('Notification not found');
  }

  const updated = await notificationRepository.markAsRead(notificationId, userId);
  return updated;
};

const markAllAsRead = async (userId) => {
  return notificationRepository.markAllAsRead(userId);
};

const createNotification = async (data) => {
  return notificationRepository.createNotification(data);
};

// Helper to extract service name cleanly from a booking
const getBookingServiceName = (booking) => {
  return (
    booking.workerService?.name ||
    booking.serviceRequest?.serviceName ||
    'Service'
  );
};

// Booking Event Notification Triggers
const notifyNewBooking = async (booking) => {
  const workerUserId = booking.workerProfile?.user?.id || booking.workerProfile?.userId;
  if (!workerUserId) return null;

  const serviceName = getBookingServiceName(booking);

  return notificationRepository.createNotification({
    userId: workerUserId,
    type: 'NEW_BOOKING',
    title: 'New Booking Request',
    message: `You received a new booking request for ${serviceName}.`,
    relatedBookingId: booking.id,
  });
};

const notifyBookingConfirmed = async (booking) => {
  const customerId = booking.customerId;
  if (!customerId) return null;

  const serviceName = getBookingServiceName(booking);

  return notificationRepository.createNotification({
    userId: customerId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed',
    message: `Your ${serviceName} booking has been confirmed.`,
    relatedBookingId: booking.id,
  });
};

const notifyBookingRejected = async (booking) => {
  const customerId = booking.customerId;
  if (!customerId) return null;

  const serviceName = getBookingServiceName(booking);

  return notificationRepository.createNotification({
    userId: customerId,
    type: 'BOOKING_REJECTED',
    title: 'Booking Rejected',
    message: `Your ${serviceName} booking was rejected.`,
    relatedBookingId: booking.id,
  });
};

const notifyBookingCancelled = async (booking) => {
  const workerUserId = booking.workerProfile?.user?.id || booking.workerProfile?.userId;
  if (!workerUserId) return null;

  const serviceName = getBookingServiceName(booking);

  return notificationRepository.createNotification({
    userId: workerUserId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    message: `A customer cancelled the booking for ${serviceName}.`,
    relatedBookingId: booking.id,
  });
};

const notifyBookingCompleted = async (booking) => {
  const customerId = booking.customerId;
  if (!customerId) return null;

  const serviceName = getBookingServiceName(booking);

  return notificationRepository.createNotification({
    userId: customerId,
    type: 'BOOKING_COMPLETED',
    title: 'Service Completed',
    message: `Your ${serviceName} booking has been marked as completed.`,
    relatedBookingId: booking.id,
  });
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  notifyNewBooking,
  notifyBookingConfirmed,
  notifyBookingRejected,
  notifyBookingCancelled,
  notifyBookingCompleted,
};
