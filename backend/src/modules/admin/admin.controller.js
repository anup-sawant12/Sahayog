const adminService = require('./admin.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats();
    return res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkers = async (req, res, next) => {
  try {
    const data = await adminService.getWorkers(req.query);
    return res.status(200).json({
      success: true,
      message: 'Workers retrieved successfully',
      data: data.workers,
      total: data.total,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkerById = async (req, res, next) => {
  try {
    const data = await adminService.getWorkerById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Worker details retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const approveWorker = async (req, res, next) => {
  try {
    const data = await adminService.approveWorker(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Worker verified and approved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const rejectWorker = async (req, res, next) => {
  try {
    const data = await adminService.rejectWorker(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Worker verification rejected',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers(req.query);
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: data.users,
      total: data.total,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const currentAdminId = req.user.userId;
    const { status } = req.body;
    const data = await adminService.updateUserStatus(req.params.id, status, currentAdminId);

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const data = await adminService.getBookings(req.query);
    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: data.bookings,
      total: data.total,
    });
  } catch (error) {
    next(error);
  }
};

const getServiceRequests = async (req, res, next) => {
  try {
    const data = await adminService.getServiceRequests(req.query);
    return res.status(200).json({
      success: true,
      message: 'Service requests retrieved successfully',
      data: data.requests,
      total: data.total,
    });
  } catch (error) {
    next(error);
  }
};

const getSkills = async (req, res, next) => {
  try {
    const data = await adminService.getSkills();
    return res.status(200).json({
      success: true,
      message: 'Skills retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const data = await adminService.createSkill(req.body);
    return res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const data = await adminService.updateSkill(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const toggleSkillStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const data = await adminService.toggleSkillStatus(req.params.id, isActive);
    return res.status(200).json({
      success: true,
      message: `Skill ${isActive ? 'activated' : 'deactivated'} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getWorkers,
  getWorkerById,
  approveWorker,
  rejectWorker,
  getUsers,
  updateUserStatus,
  getBookings,
  getServiceRequests,
  getSkills,
  createSkill,
  updateSkill,
  toggleSkillStatus,
};
