import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
  USER_REGISTER,
  USER_REGISTER_COMPLETED,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  USER_REGISTER_RESET,
} from '../actions';
import { AuthResponse } from '../../services';

interface AuthState {
  data: AuthResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  registerLoading: boolean;
  registerError: boolean;
  registerErrorMessage: string | null;
}

interface Action {
  type: string;
  payload?: any;
}

const INITIAL_STATE: AuthState = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  registerLoading: false,
  registerError: false,
  registerErrorMessage: null,
};

export default function reducer(state = INITIAL_STATE, action: Action): AuthState {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        isError: false,
        errorMessage: null,
      };

    case USER_LOGIN_COMPLETED:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
      };

    case USER_LOGIN_ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true,
        errorMessage: action.payload || 'Login failed',
      };

    case USER_LOGIN_RESET:
      return INITIAL_STATE;

    case USER_REGISTER_REQUEST:
      return {
        ...state,
        registerLoading: true,
        registerError: false,
        registerErrorMessage: null,
      };

    case USER_REGISTER_COMPLETED:
      return {
        ...state,
        data: action.payload,
        registerLoading: false,
        registerError: false,
      };

    case USER_REGISTER_ERROR:
      return {
        ...state,
        registerLoading: false,
        registerError: true,
        registerErrorMessage: action.payload || 'Registration failed',
      };

    case USER_REGISTER_RESET:
      return {
        ...state,
        registerLoading: false,
        registerError: false,
        registerErrorMessage: null,
      };

    default:
      return state;
  }
}

export const userLogin = (payload: { emailAdd: string; password: string }) => ({
  type: USER_LOGIN,
  payload,
});

export const resetLogin = () => ({
  type: USER_LOGIN_RESET,
});

export const userRegister = (payload: { email: string; password: string }) => ({
  type: USER_REGISTER,
  payload,
});

export const resetRegister = () => ({
  type: USER_REGISTER_RESET,
});

// Direct login success (for Google Sign-In and other OAuth flows)
export const loginSuccess = (payload: AuthResponse) => ({
  type: USER_LOGIN_COMPLETED,
  payload,
});