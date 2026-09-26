import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/auth.api';
import { storage } from '../utils/storage';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on load
  useEffect(() => {
    try {
      const storedToken = storage.getToken();
      const storedUser = storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to initialize auth state', e);
      storage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      storage.setToken(receivedToken);
      storage.setUser(receivedUser);
      setToken(receivedToken);
      setUser(receivedUser);
    }
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    return await authApi.register(userData);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedUserData };
      storage.setUser(nextUser);
      return nextUser;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
