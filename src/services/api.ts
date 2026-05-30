import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import storage from './inMemoryStorage';
import { isDevToken, isValidJwtToken } from './authToken';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './storageKeys';

const API_BASE_URL = 'https://finalwebdev-production.up.railway.app/api';

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/ld+json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await storage.getItem(AUTH_TOKEN_KEY);

      if (token) {
        if (!config.headers) {
          config.headers = {} as InternalAxiosRequestConfig['headers'];
        }

        if (isValidJwtToken(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (isDevToken(token)) {
          config.headers['X-Dev-User'] = token;
        }
      }
    } catch (error) {
      console.log('Error reading auth token:', error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      if (!isDevToken(token)) {
        await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
