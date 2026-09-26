import api from './api';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getWorkers: async (params = {}) => {
    const response = await api.get('/admin/workers', { params });
    return response.data;
  },

  getWorkerById: async (id) => {
    const response = await api.get(`/admin/workers/${id}`);
    return response.data;
  },

  approveWorker: async (id) => {
    const response = await api.patch(`/admin/workers/${id}/approve`);
    return response.data;
  },

  rejectWorker: async (id) => {
    const response = await api.patch(`/admin/workers/${id}/reject`);
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  getBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  getServiceRequests: async (params = {}) => {
    const response = await api.get('/admin/service-requests', { params });
    return response.data;
  },

  getSkills: async () => {
    const response = await api.get('/admin/skills');
    return response.data;
  },

  createSkill: async (skillData) => {
    const response = await api.post('/admin/skills', skillData);
    return response.data;
  },

  updateSkill: async (id, skillData) => {
    const response = await api.patch(`/admin/skills/${id}`, skillData);
    return response.data;
  },

  toggleSkillStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/skills/${id}/toggle`, { isActive });
    return response.data;
  },

  getDocuments: async (params = {}) => {
    const response = await api.get('/admin/documents', { params });
    return response.data;
  },

  getDocumentStats: async () => {
    const response = await api.get('/admin/documents/stats');
    return response.data;
  },

  getDocumentById: async (id) => {
    const response = await api.get(`/admin/documents/${id}`);
    return response.data;
  },

  verifyDocument: async (id) => {
    const response = await api.patch(`/admin/documents/${id}/verify`);
    return response.data;
  },

  rejectDocument: async (id, rejectionReason) => {
    const response = await api.patch(`/admin/documents/${id}/reject`, { rejectionReason });
    return response.data;
  },
};

export default adminApi;
