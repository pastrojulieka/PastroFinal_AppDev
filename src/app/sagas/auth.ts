import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin, authRegister, LoginParams } from '../api/auth';
import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_REGISTER,
  USER_REGISTER_COMPLETED,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
} from '../actions';
import { AuthResponse } from '../../services';

interface LoginAction {
  type: string;
  payload: LoginParams;
}

interface RegisterAction {
  type: string;
  payload: { email: string; password: string };
}

function* loginSaga(action: LoginAction) {
  try {
    yield put({ type: USER_LOGIN_REQUEST });
    const data: AuthResponse = yield call(authLogin, action.payload);
    yield put({ type: USER_LOGIN_COMPLETED, payload: data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    yield put({
      type: USER_LOGIN_ERROR,
      payload: errorMessage,
    });
  }
}

function* registerSaga(action: RegisterAction) {
  try {
    yield put({ type: USER_REGISTER_REQUEST });
    const data: AuthResponse = yield call(authRegister, action.payload.email, action.payload.password);
    // Always consider it successful if we get data back
    yield put({ type: USER_REGISTER_COMPLETED, payload: data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    yield put({
      type: USER_REGISTER_ERROR,
      payload: errorMessage,
    });
  }
}

export default function* authSaga() {
  yield takeEvery(USER_LOGIN, loginSaga);
  yield takeEvery(USER_REGISTER, registerSaga);
}
