import axios from 'axios';
import api from './api';
import localOrderService from './localOrderService';
import notificationService from './notificationService';
import storage from './inMemoryStorage';
import { hasAuthToken, isValidJwtToken } from './authToken';
import {
  AUTH_EMAIL_KEY,
  AUTH_PASSWORD_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from './storageKeys';
import { ApiResponse, RegisterCredentials, AuthResponse, User, Order } from './types';

const API_BASE_URL = 'https://finalwebdev-production.up.railway.app/api';

const saveCredentials = async (email: string, password: string): Promise<void> => {
  await storage.setItem(AUTH_EMAIL_KEY, email);
  await storage.setItem(AUTH_PASSWORD_KEY, password);
};

const clearCredentials = async (): Promise<void> => {
  await storage.multiRemove([AUTH_EMAIL_KEY, AUTH_PASSWORD_KEY]);
};

const persistSession = async (session: AuthResponse): Promise<void> => {
  await storage.setItem(AUTH_TOKEN_KEY, session.token);
  await storage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
};

type LoginResponseBody = AuthResponse & {
  success?: boolean;
  verified?: boolean;
  message?: string;
  user?: Partial<User> & { email?: string; roles?: string[]; verified?: boolean };
};

const parseLoginUser = (email: string, raw?: LoginResponseBody['user']): User => ({
  id: raw?.id ?? 0,
  email: raw?.email ?? email,
  roles: raw?.roles ?? ['ROLE_USER'],
});

const requestLogin = async (email: string, password: string) => {
  return axios.post<LoginResponseBody>(`${API_BASE_URL}/login`, { email, password }, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    validateStatus: () => true,
  });
};

const syncLocalOrdersToServer = async (): Promise<void> => {
  const localOrders = await localOrderService.getOrders();
  if (localOrders.length === 0) {
    return;
  }

  for (const local of localOrders) {
    const product_id =
      (local as Order & { product_id?: number }).product_id ??
      (local.product_name?.match(/#(\d+)/)
        ? Number(local.product_name.match(/#(\d+)/)![1])
        : 1);
    try {
      await api.post('/orders', {
        product_id,
        quantity: local.quantity,
        customer_name: local.customer_name,
        material: local.material || null,
        color: local.color || null,
      });
    } catch {
      return;
    }
  }

  await localOrderService.clear();
};

const sessionFromLoginResponse = (
  email: string,
  data: LoginResponseBody
): AuthResponse | null => {
  if (!isValidJwtToken(data.token)) {
    return null;
  }
  return {
    token: data.token!,
    user: parseLoginUser(email, data.user),
  };
};

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    await saveCredentials(email, password);

    const response = await requestLogin(email, password);
    const session = sessionFromLoginResponse(email, response.data);

    if (response.status === 200 && session) {
      await persistSession(session);
      await syncLocalOrdersToServer();
      await notificationService.registerDeviceToken();
      return { success: true, data: session };
    }

    return {
      success: false,
      message:
        response.data?.message ||
        'Login failed. Please check your credentials and try again.',
    };
  },

  tryAcquireJwtFromServer: async (): Promise<AuthResponse | null> => {
    const email = await storage.getItem(AUTH_EMAIL_KEY);
    const password = await storage.getItem(AUTH_PASSWORD_KEY);
    if (!email || !password) {
      return null;
    }

    const response = await requestLogin(email, password);
    const session = sessionFromLoginResponse(email, response.data);
    if (response.status === 200 && session) {
      await persistSession(session);
      await syncLocalOrdersToServer();
      return session;
    }
    return null;
  },

  ensureServerJwt: async (): Promise<boolean> => {
    const token = await storage.getItem(AUTH_TOKEN_KEY);
    if (isValidJwtToken(token)) {
      return true;
    }
    const session = await authService.tryAcquireJwtFromServer();
    return session != null;
  },

  register: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      const credentials: RegisterCredentials = { email, password };
      const response = await api.post<any>('/register', credentials);

      const responseData = response.data;
      if (responseData) {
        const user = responseData.user || { id: 0, email, roles: ['ROLE_USER'] };
        const token = responseData.token || '';

        return {
          success: true,
          data: { token, user },
          message:
            'Registration successful! You can log in with your email and password.',
        };
      }

      return { success: false, message: 'Registration failed - no response' };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; detail?: string } } };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          axiosError.response?.data?.detail ||
          'Registration failed. Please try again.',
      };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      await clearCredentials();
      await localOrderService.clear();
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  },

  getToken: async (): Promise<string | null> => storage.getItem(AUTH_TOKEN_KEY),

  getUser: async (): Promise<User | null> => {
    try {
      const user = await storage.getItem(AUTH_USER_KEY);
      return user ? (JSON.parse(user) as User) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => hasAuthToken(await storage.getItem(AUTH_TOKEN_KEY)),

  hasValidJwt: async (): Promise<boolean> => isValidJwtToken(await storage.getItem(AUTH_TOKEN_KEY)),

  restoreSession: async (): Promise<AuthResponse | null> => {
    try {
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      if (token?.startsWith('dev_')) {
        await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
        return null;
      }
      if (!isValidJwtToken(token)) {
        await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
        return null;
      }
      const user = await authService.getUser();
      if (user) {
        return { token: token!, user };
      }
      await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      return null;
    } catch (error) {
      console.log('Failed to restore session:', error);
      return null;
    }
  },

  setUserData: async (token: string, user: User): Promise<void> => {
    await persistSession({ token, user });
  },
};

export default authService;
