const availabilityService = require('./availability.service');

const getMyAvailability = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const availability = await availabilityService.getMyAvailability(userId);

    return res.status(200).json({
      success: true,
      message: 'Availability retrieved successfully',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

const createAvailability = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const availability = await availabilityService.createAvailability(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Availability created successfully',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const availabilityId = req.params.id;
    const availability = await availabilityService.updateAvailability(
      userId,
      availabilityId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const availabilityId = req.params.id;
    await availabilityService.deleteAvailability(userId, availabilityId);

    return res.status(200).json({
      success: true,
      message: 'Availability deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
