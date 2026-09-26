const express = require('express');
const router = express.Router();
const certificationController = require('./certification.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  createCertificationSchema,
  updateCertificationSchema,
} = require('./certification.validation');

router.get(
  '/',
  authenticate,
  authorize('WORKER'),
  certificationController.getMyCertifications
);

router.post(
  '/',
  authenticate,
  authorize('WORKER'),
  validate(createCertificationSchema),
  certificationController.createCertification
);

router.patch(
  '/:id',
  authenticate,
  authorize('WORKER'),
  validate(updateCertificationSchema),
  certificationController.updateCertification
);

router.delete(
  '/:id',
  authenticate,
  authorize('WORKER'),
  certificationController.deleteCertification
);

module.exports = router;
