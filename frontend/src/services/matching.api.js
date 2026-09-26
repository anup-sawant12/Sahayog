import api from './api';

export const createServiceRequest = async (data) => {
  const response = await api.post('/matching/requests', data);
  return response.data;
};

export const getServiceRequest = async (id) => {
  const response = await api.get(`/matching/requests/${id}`);
  return response.data;
};

export const rematchServiceRequest = async (id) => {
  const response = await api.post(`/matching/requests/${id}/rematch`);
  return response.data;
};

export const matchingApi = {
  createServiceRequest,
  getServiceRequest,
  rematchServiceRequest,
};

export default matchingApi;
