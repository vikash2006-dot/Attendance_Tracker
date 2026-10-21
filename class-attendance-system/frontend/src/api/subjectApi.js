import { apiClient } from './client';

export const subjectApi = {
  // Get all subjects (optional query params e.g. { semester: 4 })
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/subjects?${query}` : '/subjects';
    return await apiClient(endpoint, { method: 'GET' });
  },

  // Get single subject by ID
  getById: async (id) => {
    return await apiClient(`/subjects/${id}`, { method: 'GET' });
  },

  // Create a new subject
  create: async (subjectData) => {
    return await apiClient('/subjects', {
      method: 'POST',
      body: subjectData
    });
  },

  // Update existing subject
  update: async (id, subjectData) => {
    return await apiClient(`/subjects/${id}`, {
      method: 'PUT',
      body: subjectData
    });
  },

  // Delete a subject
  delete: async (id) => {
    return await apiClient(`/subjects/${id}`, {
      method: 'DELETE'
    });
  }
};
