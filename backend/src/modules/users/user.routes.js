const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const { updateProfileSchema } = require('./user.validation');

router.get('/me', authenticate, userController.getMyProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateMyProfile);

module.exports = router;
