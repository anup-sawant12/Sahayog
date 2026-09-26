import api from './api';

export const userApi = {
  getMyProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },
};

export default userApi;
