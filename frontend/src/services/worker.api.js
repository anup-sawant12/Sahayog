import api from './api';

export const workerApi = {
  getWorkerProfile: async () => {
    const response = await api.get('/workers/profile');
    return response.data;
  },

  createWorkerProfile: async (data) => {
    const response = await api.post('/workers/profile', data);
    return response.data;
  },

  updateWorkerProfile: async (data) => {
    const response = await api.patch('/workers/profile', data);
    return response.data;
  },
};

export default workerApi;
