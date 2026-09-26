const matchingService = require('./matching.service');

const createServiceRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await matchingService.createServiceRequest(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getServiceRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const requestId = req.params.id;
    const result = await matchingService.getServiceRequest(userId, requestId);

    return res.status(200).json({
      success: true,
      message: 'Service request retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const rematchServiceRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const requestId = req.params.id;
    const result = await matchingService.rematchServiceRequest(userId, requestId);

    return res.status(200).json({
      success: true,
      message: 'Service request rematched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest,
  getServiceRequest,
  rematchServiceRequest,
};
