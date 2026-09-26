const express = require('express');
const router = express.Router();
const availabilityController = require('./availability.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  createAvailabilitySchema,
  updateAvailabilitySchema,
} = require('./availability.validation');

router.get(
  '/',
  authenticate,
  authorize('WORKER'),
  availabilityController.getMyAvailability
);

router.post(
  '/',
  authenticate,
  authorize('WORKER'),
  validate(createAvailabilitySchema),
  availabilityController.createAvailability
);

router.patch(
  '/:id',
  authenticate,
  authorize('WORKER'),
  validate(updateAvailabilitySchema),
  availabilityController.updateAvailability
);

router.delete(
  '/:id',
  authenticate,
  authorize('WORKER'),
  availabilityController.deleteAvailability
);

module.exports = router;
