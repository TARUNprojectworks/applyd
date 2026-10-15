import axios from 'axios';

// One shared Axios instance so every request uses the same base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor: runs before EVERY request and attaches the JWT if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if the token expired (401), log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Reads the { message } our backend sends, or falls back to a generic text
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return 'Could not reach the server. Please try again.';
}

export default api;
