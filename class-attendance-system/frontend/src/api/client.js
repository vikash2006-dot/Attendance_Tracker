/**
 * Normalizes and resolves the centralized API base URL.
 * Handles cases where:
 * - VITE_API_URL is undefined (falls back to local 'http://localhost:5001/api')
 * - VITE_API_URL already contains '/api' (e.g. 'https://service.onrender.com/api')
 * - VITE_API_URL lacks '/api' (e.g. 'https://service.onrender.com' or 'https://service.onrender.com/')
 * - Prevents appending '/api' twice.
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  const rawUrl = (typeof envUrl === 'string' && envUrl.trim())
    ? envUrl.trim()
    : 'http://localhost:5001/api';

  // Strip all trailing slashes
  const sanitizedUrl = rawUrl.replace(/\/+$/, '');

  // If it already ends with '/api', return as is without appending '/api' again
  if (sanitizedUrl.endsWith('/api')) {
    return sanitizedUrl;
  }

  // Otherwise append '/api'
  return `${sanitizedUrl}/api`;
}

export const BASE_URL = getApiBaseUrl();

/**
 * Standard fetch wrapper for making API calls
 * @param {string} endpoint - API route (e.g. '/auth/login')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 */
export async function apiClient(endpoint, options = {}) {
  // Ensure endpoint starts with '/'
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Avoid duplicate '/api' segment if caller supplied an endpoint starting with '/api/'
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
  } else if (cleanEndpoint === '/api') {
    cleanEndpoint = '';
  }

  const url = `${BASE_URL}${cleanEndpoint}`;
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

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // Non-JSON response (e.g. HTML 404 page from proxy or web server)
    try {
      await response.text();
    } catch {
      // Ignore text read failure
    }
  }

  if (!response.ok) {
    let errorMessage = data && data.message;
    if (!errorMessage) {
      if (response.status === 404) {
        errorMessage = `API endpoint not found (HTTP 404 at ${url}). Please check your backend URL configuration.`;
      } else if (response.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (response.status >= 500) {
        errorMessage = `Server error (HTTP ${response.status}). The backend service may still be spinning up on Render.`;
      } else {
        errorMessage = `Request failed with HTTP status ${response.status}`;
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
