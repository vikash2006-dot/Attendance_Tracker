import { apiClient } from './client';

export const authApi = {
  // Login with email and password
  login: async (credentials) => {
    return await apiClient('/auth/login', {
      method: 'POST',
      body: credentials
    });
  },

  // Register a new student
  register: async (userData) => {
    return await apiClient('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  // Get current logged-in user profile
  getMe: async () => {
    return await apiClient('/auth/me', {
      method: 'GET'
    });
  }
};
