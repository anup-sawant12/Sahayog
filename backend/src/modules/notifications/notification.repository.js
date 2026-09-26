const prisma = require('../../config/database');

const getUserNotifications = async (userId, { skip = 0, take = 50 } = {}) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: Number(skip) || 0,
    take: Math.min(Number(take) || 50, 100),
  });
};

const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

const getNotificationById = async (id, userId) => {
  return prisma.notification.findFirst({
    where: {
      id,
      userId,
    },
  });
};

const markAsRead = async (id, userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.notification.findUnique({
    where: { id },
  });
};

const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

const createNotification = async (data) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedBookingId: data.relatedBookingId || null,
      isRead: false,
    },
  });
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  createNotification,
};
