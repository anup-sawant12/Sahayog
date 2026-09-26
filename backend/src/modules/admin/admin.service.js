const adminRepository = require('./admin.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const getDashboardStats = async () => {
  return adminRepository.getDashboardStats();
};

const getWorkers = async (filters) => {
  const result = await adminRepository.getWorkers(filters);
  const formattedWorkers = result.workers.map((w) => ({
    ...w,
    skills: w.workerSkills || [],
    services: w.workerServices || [],
  }));
  return {
    workers: formattedWorkers,
    total: result.total,
  };
};

const getWorkerById = async (id) => {
  const worker = await adminRepository.getWorkerById(id);
  if (!worker) {
    throw ApiError.notFound('Worker profile not found');
  }
  return {
    ...worker,
    skills: worker.workerSkills || [],
    services: worker.workerServices || [],
    certifications: worker.workerCertifications || [],
    availability: worker.workerAvailability || [],
  };
};

const approveWorker = async (id) => {
  const worker = await adminRepository.getWorkerById(id);
  if (!worker) {
    throw ApiError.notFound('Worker profile not found');
  }

  return adminRepository.updateWorkerVerification(id, 'APPROVED');
};

const rejectWorker = async (id) => {
  const worker = await adminRepository.getWorkerById(id);
  if (!worker) {
    throw ApiError.notFound('Worker profile not found');
  }

  return adminRepository.updateWorkerVerification(id, 'REJECTED');
};

const normalizeRole = (role) => {
  if (
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    role === 'COOPERATIVE_ADMIN' ||
    role === 'FEDERATION_ADMIN'
  ) {
    return 'ADMIN';
  }
  return role;
};

const getUsers = async (filters) => {
  const { users, total } = await adminRepository.getUsers(filters);
  const normalized = users.map((u) => ({
    ...u,
    role: normalizeRole(u.role),
  }));
  return { users: normalized, total };
};

const updateUserStatus = async (id, status, currentAdminId) => {
  if (id === currentAdminId) {
    throw ApiError.forbidden('You cannot change the status of your own account');
  }

  const user = await adminRepository.getUserById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (normalizeRole(user.role) === 'ADMIN') {
    throw ApiError.forbidden('Cannot modify status of another administrator account');
  }

  const updated = await adminRepository.updateUserStatus(id, status);
  return {
    ...updated,
    role: normalizeRole(updated.role),
  };
};

const getBookings = async (filters) => {
  return adminRepository.getBookings(filters);
};

const getServiceRequests = async (filters) => {
  return adminRepository.getServiceRequests(filters);
};

const getSkills = async () => {
  return adminRepository.getSkills();
};

const createSkill = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw ApiError.badRequest('Skill name is required');
  }

  return adminRepository.createSkill(data);
};

const updateSkill = async (id, data) => {
  return adminRepository.updateSkill(id, data);
};

const toggleSkillStatus = async (id, isActive) => {
  return adminRepository.updateSkill(id, { isActive });
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
