const express = require('express');
const router = express.Router();
const workerController = require('./worker.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  createWorkerProfileSchema,
  updateWorkerProfileSchema,
} = require('./worker.validation');

router.post(
  '/profile',
  authenticate,
  authorize('WORKER'),
  validate(createWorkerProfileSchema),
  workerController.createWorkerProfile
);

router.get(
  '/profile',
  authenticate,
  authorize('WORKER'),
  workerController.getWorkerProfile
);

router.patch(
  '/profile',
  authenticate,
  authorize('WORKER'),
  validate(updateWorkerProfileSchema),
  workerController.updateWorkerProfile
);

module.exports = router;
