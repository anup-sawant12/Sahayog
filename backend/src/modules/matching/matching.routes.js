const express = require('express');
const router = express.Router();
const matchingController = require('./matching.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const { createServiceRequestSchema } = require('./matching.validation');

router.post(
  '/requests',
  authenticate,
  authorize('CUSTOMER'),
  validate(createServiceRequestSchema),
  matchingController.createServiceRequest
);

router.get(
  '/requests/:id',
  authenticate,
  matchingController.getServiceRequest
);

router.post(
  '/requests/:id/rematch',
  authenticate,
  authorize('CUSTOMER'),
  matchingController.rematchServiceRequest
);

module.exports = router;
