import axios from 'axios';
import jsCookie from 'js-cookie';

const baseURL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5001/api'
  : '/api';

console.log('[API] Client initialized with baseURL:', baseURL);

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = jsCookie.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Here you would typically call your refresh token endpoint
        // await apiClient.post('/auth/refresh');
        // return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
