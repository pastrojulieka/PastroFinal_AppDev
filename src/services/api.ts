import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './storageKeys';

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
      const raw = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!raw) {
        console.log('API Interceptor - Token: NOT FOUND (no key)');
      } else {
        let token = raw;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.token) token = parsed.token;
        } catch (_) {
          // raw is a plain token string
        }
        if (token) {
          const headers = { ...(config.headers as Record<string, string> | undefined) };
          headers.Authorization = `Bearer ${token}`;
          config.headers = headers as any;
          console.log('API Interceptor - Added Authorization header');
        } else {
          console.log('API Interceptor - Token: NOT FOUND (parse produced no token)');
        }
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    console.log('API Request:', config.method, `${config.baseURL}${config.url}`);
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    }
    return Promise.reject(error);
  }
);

export default api;
