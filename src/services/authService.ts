import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginCredentials, RegisterCredentials, AuthResponse, User } from './types';

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await api.post<AuthResponse>('/login', credentials);
      console.log('Login response:', JSON.stringify(response.data, null, 2));

      if (response.data.token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        console.log('Token stored successfully');
        return { success: true, data: response.data };
      }
      console.log('No token in response');
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  },

  register: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const credentials: RegisterCredentials = { email, password };
      const response = await api.post<AuthResponse>('/register', credentials);
      
      if (response.data.token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        return { success: true, data: response.data };
      }
      return { success: false, message: 'Registration completed but no token received' };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  },

  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },
  
  getUser: async (): Promise<User | null> => {
    try {
      const user = await AsyncStorage.getItem(AUTH_USER_KEY);
      return user ? JSON.parse(user) as User : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  setUserData: async (token: string, user: User): Promise<void> => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },
};

export default authService;
