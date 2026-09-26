const workerService = require('./worker.service');

const createWorkerProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workerProfile = await workerService.createWorkerProfile(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Worker profile created successfully',
      data: {
        workerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWorkerProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workerProfile = await workerService.getWorkerProfile(userId);

    return res.status(200).json({
      success: true,
      message: 'Worker profile fetched successfully',
      data: {
        workerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateWorkerProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workerProfile = await workerService.updateWorkerProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully',
      data: {
        workerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkerProfile,
  getWorkerProfile,
  updateWorkerProfile,
};
