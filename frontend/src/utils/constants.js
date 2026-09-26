export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
};

export const STORAGE_KEYS = {
  TOKEN: 'coop_auth_token',
  USER: 'coop_auth_user',
};
