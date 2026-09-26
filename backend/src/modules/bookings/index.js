const bookingRoutes = require('./booking.routes');
const bookingController = require('./booking.controller');
const bookingService = require('./booking.service');
const bookingRepository = require('./booking.repository');

module.exports = {
  bookingRoutes,
  bookingController,
  bookingService,
  bookingRepository,
};
