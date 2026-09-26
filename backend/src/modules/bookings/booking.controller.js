const bookingService = require('./booking.service');

const createBooking = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const booking = await bookingService.createBooking(customerId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerBookings = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const { status } = req.query;
    const bookings = await bookingService.getCustomerBookings(customerId, { status });

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerBooking = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const booking = await bookingService.getCustomerBooking(customerId, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const { cancellationReason } = req.body || {};
    const booking = await bookingService.cancelBooking(customerId, req.params.id, cancellationReason);

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkerBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    const bookings = await bookingService.getWorkerBookings(userId, { status });

    return res.status(200).json({
      success: true,
      message: 'Worker bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkerBooking = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const booking = await bookingService.getWorkerBooking(userId, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Worker booking retrieved successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const booking = await bookingService.acceptBooking(userId, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cancellationReason } = req.body || {};
    const booking = await bookingService.rejectBooking(userId, req.params.id, cancellationReason);

    return res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const completeBooking = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const booking = await bookingService.completeBooking(userId, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getCustomerBooking,
  cancelBooking,
  getWorkerBookings,
  getWorkerBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
};
