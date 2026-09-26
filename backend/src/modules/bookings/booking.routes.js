const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  createBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
} = require('./booking.validation');

// ----------------------------------------------------
// Worker Routes
// Registered before /:id so 'worker' is not treated as an id
// ----------------------------------------------------

router.get(
  '/worker',
  authenticate,
  authorize('WORKER'),
  bookingController.getWorkerBookings
);

router.get(
  '/worker/:id',
  authenticate,
  authorize('WORKER'),
  bookingController.getWorkerBooking
);

router.patch(
  '/worker/:id/accept',
  authenticate,
  authorize('WORKER'),
  bookingController.acceptBooking
);

router.patch(
  '/worker/:id/reject',
  authenticate,
  authorize('WORKER'),
  validate(rejectBookingSchema),
  bookingController.rejectBooking
);

router.patch(
  '/worker/:id/complete',
  authenticate,
  authorize('WORKER'),
  bookingController.completeBooking
);

// ----------------------------------------------------
// Customer Routes
// ----------------------------------------------------

router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  bookingController.getCustomerBookings
);

router.get(
  '/:id',
  authenticate,
  authorize('CUSTOMER'),
  bookingController.getCustomerBooking
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize('CUSTOMER'),
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

module.exports = router;
