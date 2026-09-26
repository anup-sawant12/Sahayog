import api from './api';

export const getMyAvailability = async () => {
  const response = await api.get('/workers/availability');
  return response.data;
};

export const createAvailability = async (data) => {
  const response = await api.post('/workers/availability', data);
  return response.data;
};

export const updateAvailability = async (id, data) => {
  const response = await api.patch(`/workers/availability/${id}`, data);
  return response.data;
};

export const deleteAvailability = async (id) => {
  const response = await api.delete(`/workers/availability/${id}`);
  return response.data;
};

export const availabilityApi = {
  getMyAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};

export default availabilityApi;
