const express = require('express');
const router = express.Router();
const serviceAreaController = require('./service-area.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  createServiceAreaSchema,
  updateServiceAreaSchema,
} = require('./service-area.validation');

router.get(
  '/',
  authenticate,
  authorize('WORKER'),
  serviceAreaController.getMyServiceAreas
);

router.post(
  '/',
  authenticate,
  authorize('WORKER'),
  validate(createServiceAreaSchema),
  serviceAreaController.createServiceArea
);

router.patch(
  '/:id',
  authenticate,
  authorize('WORKER'),
  validate(updateServiceAreaSchema),
  serviceAreaController.updateServiceArea
);

router.delete(
  '/:id',
  authenticate,
  authorize('WORKER'),
  serviceAreaController.deleteServiceArea
);

module.exports = router;
