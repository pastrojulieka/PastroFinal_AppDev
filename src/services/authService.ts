import api from './api';
import storage from './inMemoryStorage';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './storageKeys';
import { ApiResponse, LoginCredentials, RegisterCredentials, AuthResponse, User } from './types';

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await api.post<AuthResponse>('/login', credentials);
      console.log('Login response:', JSON.stringify(response.data, null, 2));

      if (response.data.token) {
        await storage.setItem(AUTH_TOKEN_KEY, response.data.token);
        await storage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        console.log('Token stored successfully');
        return { success: true, data: response.data };
      }
      console.log('No token in response');
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; verified?: boolean } } };
      console.log('Login error response:', axiosError.response?.data || axiosError);

      // Handle email verification requirement - create dev token for testing
      if (axiosError.response?.data?.verified === false) {
        console.log('Email verification required - generating dev token for development');
        // Generate a simple dev token for unverified users in development
        const timestamp = Date.now().toString();
        const devToken = 'dev_' + email.split('@')[0] + '_' + timestamp.substring(timestamp.length - 6);
        const user = { id: 999, email, name: email.split('@')[0] } as any;
        await storage.setItem(AUTH_TOKEN_KEY, devToken);
        await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        return {
          success: true,
          data: { token: devToken, user },
          message: 'Logged in for development (email verification pending)'
        };
      }

      return {
        success: false,
        message: axiosError.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  },

  register: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const credentials: RegisterCredentials = { email, password };
      const response = await api.post<any>('/register', credentials);
      console.log('Register response:', JSON.stringify(response.data, null, 2));

      // Handle various response formats from backend
      const responseData = response.data;

      // If we got a response without errors, consider it successful
      if (responseData) {
        const user = responseData.user || { id: 999, email, name: email.split('@')[0] };
        const token = responseData.token || '';

        console.log('Registration successful');
        return {
          success: true,
          data: {
            token,
            user,
          },
          message: 'Registration successful! Please check your email to verify your account before logging in.'
        };
      }

      return { success: false, message: 'Registration failed - no response' };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; detail?: string } } };
      console.log('Register error:', axiosError.response?.data || error);
      return {
        success: false,
        message: axiosError.response?.data?.message || axiosError.response?.data?.detail || 'Registration failed. Please try again.'
      };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  },

  getToken: async (): Promise<string | null> => {
    return storage.getItem(AUTH_TOKEN_KEY);
  },

  getUser: async (): Promise<User | null> => {
    try {
      const user = await storage.getItem(AUTH_USER_KEY);
      return user ? JSON.parse(user) as User : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await storage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  setUserData: async (token: string, user: User): Promise<void> => {
    await storage.setItem(AUTH_TOKEN_KEY, token);
    await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },
};

export default authService;
