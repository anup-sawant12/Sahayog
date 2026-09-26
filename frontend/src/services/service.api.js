import api from './api';

export const getMyServices = async () => {
  const response = await api.get('/workers/services');
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post('/workers/services', data);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await api.patch(`/workers/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/workers/services/${id}`);
  return response.data;
};

export const serviceApi = {
  getMyServices,
  createService,
  updateService,
  deleteService,
};

export default serviceApi;
