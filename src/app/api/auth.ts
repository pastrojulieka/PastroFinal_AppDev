import { authService, AuthResponse } from '../../services';

export interface LoginParams {
  emailAdd: string;
  password: string;
}

export async function authLogin({ emailAdd, password }: LoginParams): Promise<AuthResponse> {
  const result = await authService.login(emailAdd, password);

  if (result.success && result.data) {
    return result.data;
  } else {
    throw new Error(result.message || 'Login failed');
  }
}

export async function authRegister(email: string, password: string) {
  const result = await authService.register(email, password);

  if (result.success) {
    // Return data even for unverified users in development
    return result.data || { user: { email }, token: result.message || '' };
  } else {
    throw new Error(result.message || 'Registration failed');
  }
}