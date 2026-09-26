const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { validateNotificationId } = require('./notification.validation');

// All notification routes require authentication
router.use(authenticate);

// 1. Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// 2. Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// 3. Get authenticated user's notifications (newest first, optional pagination)
router.get('/', notificationController.getUserNotifications);

// 4. Mark single notification as read
router.patch('/:id/read', validateNotificationId, notificationController.markAsRead);

module.exports = router;
