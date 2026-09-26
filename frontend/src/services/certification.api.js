import api from './api';

export const getMyCertifications = async () => {
  const response = await api.get('/workers/certifications');
  return response.data;
};

export const createCertification = async (data) => {
  const response = await api.post('/workers/certifications', data);
  return response.data;
};

export const updateCertification = async (id, data) => {
  const response = await api.patch(`/workers/certifications/${id}`, data);
  return response.data;
};

export const deleteCertification = async (id) => {
  const response = await api.delete(`/workers/certifications/${id}`);
  return response.data;
};

export const certificationApi = {
  getMyCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
};

export default certificationApi;
