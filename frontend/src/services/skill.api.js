import api from './api';

export const skillApi = {
  getSkills: async () => {
    const response = await api.get('/skills');
    return response.data;
  },

  getMySkills: async () => {
    const response = await api.get('/workers/skills');
    return response.data;
  },

  addSkill: async (data) => {
    const response = await api.post('/workers/skills', data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await api.patch(`/workers/skills/${id}`, data);
    return response.data;
  },

  removeSkill: async (id) => {
    const response = await api.delete(`/workers/skills/${id}`);
    return response.data;
  },
};

export default skillApi;
