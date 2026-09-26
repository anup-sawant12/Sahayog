import api from './api';
import { API_BASE_URL } from '../utils/constants';

export const documentApi = {
  // Worker KYC APIs
  getMyDocuments: async () => {
    const response = await api.get('/worker/documents');
    return response.data;
  },

  getDocumentById: async (id) => {
    const response = await api.get(`/worker/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (data, onUploadProgress) => {
    let headers = {};
    let payload = data;

    // Check if FormData
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await api.post('/worker/documents', payload, {
      headers,
      onUploadProgress,
    });
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/worker/documents/${id}`);
    return response.data;
  },

  // Authenticated View & Download APIs for Worker
  viewWorkerDocument: async (id) => {
    const response = await api.get(`/worker/documents/${id}/view`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadWorkerDocument: async (id) => {
    const response = await api.get(`/worker/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getWorkerDocumentFileUrl: (id) => {
    return `${API_BASE_URL}/worker/documents/${id}/view`;
  },

  // Admin KYC APIs
  getAdminDocuments: async (params = {}) => {
    const response = await api.get('/admin/documents', { params });
    return response.data;
  },

  getAdminDocumentStats: async () => {
    const response = await api.get('/admin/documents/stats');
    return response.data;
  },

  getAdminDocumentById: async (id) => {
    const response = await api.get(`/admin/documents/${id}`);
    return response.data;
  },

  verifyDocument: async (id) => {
    const response = await api.patch(`/admin/documents/${id}/verify`);
    return response.data;
  },

  rejectDocument: async (id, rejectionReason) => {
    const response = await api.patch(`/admin/documents/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  // Authenticated View & Download APIs for Admin
  viewAdminDocument: async (id) => {
    const response = await api.get(`/admin/documents/${id}/view`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadAdminDocument: async (id) => {
    const response = await api.get(`/admin/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getAdminDocumentFileUrl: (id) => {
    return `${API_BASE_URL}/admin/documents/${id}/view`;
  },
};

export default documentApi;
