import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5145/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error info for debugging
    if (error.response?.status === 400) {
      console.error('400 Bad Request:', {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        data: error.config?.data,
        message: error.response?.data?.message,
      });
    }
    
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch a custom event instead of hard redirect
      window.dispatchEvent(new Event('auth-logout'));
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        // Use replace to avoid history issues
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
