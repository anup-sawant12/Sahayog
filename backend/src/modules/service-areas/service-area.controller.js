const serviceAreaService = require('./service-area.service');

const getMyServiceAreas = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const serviceAreas = await serviceAreaService.getMyServiceAreas(userId);

    return res.status(200).json({
      success: true,
      message: 'Service areas retrieved successfully',
      data: serviceAreas,
    });
  } catch (error) {
    next(error);
  }
};

const createServiceArea = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const serviceArea = await serviceAreaService.createServiceArea(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Service area created successfully',
      data: serviceArea,
    });
  } catch (error) {
    next(error);
  }
};

const updateServiceArea = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const serviceAreaId = req.params.id;
    const serviceArea = await serviceAreaService.updateServiceArea(
      userId,
      serviceAreaId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Service area updated successfully',
      data: serviceArea,
    });
  } catch (error) {
    next(error);
  }
};

const deleteServiceArea = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const serviceAreaId = req.params.id;
    await serviceAreaService.deleteServiceArea(userId, serviceAreaId);

    return res.status(200).json({
      success: true,
      message: 'Service area deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};
