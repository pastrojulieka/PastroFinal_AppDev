import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin } from '../api/auth';
import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
} from '../actions';

// Demo bypass: use demo@demo.com / demo123 to test navigation without backend
const DEMO_EMAIL = 'demo@demo.com';
const DEMO_PASSWORD = 'demo123';

function* loginSaga(action) {
  try {
    yield put({ type: USER_LOGIN_REQUEST });
    const { emailAdd, password } = action.payload || {};
    if (emailAdd === DEMO_EMAIL && password === DEMO_PASSWORD) {
      yield put({ type: USER_LOGIN_COMPLETED, payload: { user: 'Demo User', token: 'demo' } });
      return;
    }
    const data = yield call(authLogin, action.payload);
    yield put({ type: USER_LOGIN_COMPLETED, payload: data });
  } catch (error) {
    yield put({
      type: USER_LOGIN_ERROR,
      payload: error?.message || 'Login failed',
    });
  }
}

export default function* authSaga() {
  yield takeEvery(USER_LOGIN, loginSaga);
}
