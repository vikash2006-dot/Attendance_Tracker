import { apiClient } from './client';

export const dashboardApi = {
  // Get admin dashboard metrics and summaries
  getStats: async () => {
    return await apiClient('/dashboard', {
      method: 'GET'
    });
  }
};
