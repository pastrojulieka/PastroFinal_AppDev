import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.196.186:8000/api';

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
      const token = await AsyncStorage.getItem('token');
      console.log('API Interceptor - Token:', token ? 'Found' : 'NOT FOUND');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API Interceptor - Added Authorization header');
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
