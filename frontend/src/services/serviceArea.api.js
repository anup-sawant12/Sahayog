import api from './api';

export const getMyServiceAreas = async () => {
  const response = await api.get('/workers/service-areas');
  return response.data;
};

export const createServiceArea = async (data) => {
  const response = await api.post('/workers/service-areas', data);
  return response.data;
};

export const updateServiceArea = async (id, data) => {
  const response = await api.patch(`/workers/service-areas/${id}`, data);
  return response.data;
};

export const deleteServiceArea = async (id) => {
  const response = await api.delete(`/workers/service-areas/${id}`);
  return response.data;
};

export const serviceAreaApi = {
  getMyServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};

export default serviceAreaApi;
