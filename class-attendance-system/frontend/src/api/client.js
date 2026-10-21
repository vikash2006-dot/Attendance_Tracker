// API Base URL from Vite environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Standard fetch wrapper for making API calls
 * @param {string} endpoint - API route (e.g. '/auth/login')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('attendance_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  // If response is 204 No Content
  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { message: 'Unexpected server response' };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
