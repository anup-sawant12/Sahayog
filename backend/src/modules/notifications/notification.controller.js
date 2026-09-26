const notificationService = require('./notification.service');

const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await notificationService.getUserNotifications(userId, req.query);

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = await notificationService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      message: 'Unread notification count retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    const notification = await notificationService.markAsRead(userId, notificationId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
