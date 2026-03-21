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
    const { response, config } = error;
    
    if (response) {
      console.error(`[API ERROR] ${config.method?.toUpperCase()} ${config.url}: ${response.status} ${response.data?.message || ''}`);
      
      if (response.status === 401 && !config._retry) {
        config._retry = true;
        
        try {
          console.log('[API] Attempting token refresh...');
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
          const newToken = data.accessToken;
          
          if (newToken) {
            jsCookie.set('accessToken', newToken, { 
              expires: 15 / (24 * 60),
              path: '/'
            });
            
            // Retry original request with new token
            config.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(config);
          }
        } catch (refreshError) {
          console.error('[API] Refresh flow failed:', refreshError);
          jsCookie.remove('accessToken');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?msg=session_expired';
          }
        }
      }
    } else {
      console.error(`[NETWORK ERROR] ${config.method?.toUpperCase()} ${config.url}:`, error.message);
    }
    
    return Promise.reject(error);
  }
);
