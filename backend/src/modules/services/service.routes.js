const express = require('express');
const router = express.Router();
const serviceController = require('./service.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  createServiceSchema,
  updateServiceSchema,
} = require('./service.validation');

router.get(
  '/',
  authenticate,
  authorize('WORKER'),
  serviceController.getMyServices
);

router.post(
  '/',
  authenticate,
  authorize('WORKER'),
  validate(createServiceSchema),
  serviceController.createService
);

router.patch(
  '/:id',
  authenticate,
  authorize('WORKER'),
  validate(updateServiceSchema),
  serviceController.updateService
);

router.delete(
  '/:id',
  authenticate,
  authorize('WORKER'),
  serviceController.deleteService
);

module.exports = router;
