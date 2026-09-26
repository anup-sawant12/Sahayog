const serviceService = require('./service.service');

const getMyServices = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const services = await serviceService.getMyServices(userId);

    return res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const service = await serviceService.createService(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const serviceId = req.params.id;
    const service = await serviceService.updateService(userId, serviceId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const serviceId = req.params.id;
    await serviceService.deleteService(userId, serviceId);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyServices,
  createService,
  updateService,
  deleteService,
};
