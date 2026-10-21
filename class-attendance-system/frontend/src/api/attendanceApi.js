import { apiClient } from './client';

export const attendanceApi = {
  // Get attendance sheet for a subject, date and optional section
  getSheet: async (subjectId, date, section = 'ALL') => {
    const params = new URLSearchParams({
      subjectId,
      date,
      ...(section ? { section } : {})
    });
    return await apiClient(`/attendance/sheet?${params.toString()}`, {
      method: 'GET'
    });
  },

  // Mark or update attendance sheet
  markAttendance: async (payload) => {
    return await apiClient('/attendance', {
      method: 'POST',
      body: payload
    });
  },

  // Update attendance sheet by ID
  updateById: async (id, payload) => {
    return await apiClient(`/attendance/${id}`, {
      method: 'PUT',
      body: payload
    });
  },

  // Get all attendance sheets (admin history)
  getAllSheets: async () => {
    return await apiClient('/attendance', {
      method: 'GET'
    });
  },

  // Get student's overall attendance across their subjects
  getMySummary: async () => {
    return await apiClient('/attendance/my', {
      method: 'GET'
    });
  },

  // Get student's date-wise attendance records for a specific subject
  getMySubjectDetail: async (subjectId) => {
    return await apiClient(`/attendance/my/${subjectId}`, {
      method: 'GET'
    });
  },

  // Get shortage list (< 75% attendance)
  getShortageReport: async () => {
    return await apiClient('/attendance/shortage', {
      method: 'GET'
    });
  }
};
