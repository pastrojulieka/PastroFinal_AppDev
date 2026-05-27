import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import storage from './inMemoryStorage';
import { AUTH_TOKEN_KEY } from './storageKeys';

const API_BASE_URL = 'https://finalwebdev-production.up.railway.app/api';

console.log('API baseURL:', API_BASE_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/ld+json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      console.log('🔵 API Interceptor - Token found:', token ? 'YES' : 'NO');

      if (token) {
        // Ensure headers object exists
        if (!config.headers) {
          config.headers = {} as any;
        }

        if (token.startsWith('dev_')) {
          // For dev tokens, send as custom header to bypass JWT validation
          config.headers['X-Dev-User'] = token;
          console.log('✅ API Interceptor - Added X-Dev-User header (dev mode)');
        } else {
          // Send real JWT tokens with Bearer scheme
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ API Interceptor - Added Authorization header with JWT');
        }
      } else {
        console.log('⚠️ API Interceptor - Token: NOT FOUND');
      }
    } catch (error) {
      console.log('❌ Error getting token from storage:', error);
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired
      console.log('Unauthorized - 401 status');
    }
    return Promise.reject(error);
  }
);

export default api;
