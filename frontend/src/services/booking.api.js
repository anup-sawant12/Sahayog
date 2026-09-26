import api from './api';

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const getCustomerBookings = async (params) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const getCustomerBooking = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const cancelBooking = async (id, data) => {
  const response = await api.patch(`/bookings/${id}/cancel`, data);
  return response.data;
};

export const getWorkerBookings = async (params) => {
  const response = await api.get('/bookings/worker', { params });
  return response.data;
};

export const getWorkerBooking = async (id) => {
  const response = await api.get(`/bookings/worker/${id}`);
  return response.data;
};

export const acceptBooking = async (id) => {
  const response = await api.patch(`/bookings/worker/${id}/accept`);
  return response.data;
};

export const rejectBooking = async (id, data) => {
  const response = await api.patch(`/bookings/worker/${id}/reject`, data);
  return response.data;
};

export const completeBooking = async (id) => {
  const response = await api.patch(`/bookings/worker/${id}/complete`);
  return response.data;
};

export const bookingApi = {
  createBooking,
  getCustomerBookings,
  getCustomerBooking,
  cancelBooking,
  getWorkerBookings,
  getWorkerBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
};

export default bookingApi;
