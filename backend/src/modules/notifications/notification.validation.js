const { z } = require('zod');

const notificationIdParamSchema = z.object({
  id: z.string({ required_error: 'Notification ID is required' }).trim().min(1, 'Notification ID cannot be empty'),
});

const validateNotificationId = (req, res, next) => {
  try {
    notificationIdParamSchema.parse(req.params);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  notificationIdParamSchema,
  validateNotificationId,
};
