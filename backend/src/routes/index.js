const express = require('express');
const router = express.Router();
const { authRoutes } = require('../modules/auth');
const { userRoutes } = require('../modules/users');
const { workerRoutes } = require('../modules/workers');
const { skillRoutes } = require('../modules/skills');
const { certificationRoutes } = require('../modules/certifications');
const { availabilityRoutes } = require('../modules/availability');
const { serviceAreaRoutes } = require('../modules/service-areas');
const { serviceRoutes } = require('../modules/services');
const { matchingRoutes } = require('../modules/matching');
const { bookingRoutes } = require('../modules/bookings');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workers', workerRoutes);
router.use('/workers/certifications', certificationRoutes);
router.use('/workers/availability', availabilityRoutes);
router.use('/workers/service-areas', serviceAreaRoutes);
router.use('/workers/services', serviceRoutes);
router.use('/matching', matchingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/', skillRoutes);

module.exports = router;
