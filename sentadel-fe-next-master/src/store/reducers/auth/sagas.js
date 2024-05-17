import { all, put, takeEvery } from "redux-saga/effects";
import actions from "./actions";

import { postLogin } from "@/services/auth";

export function* POST_LOGIN(payload) {
  console.log("asdsad - payload", payload);
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, authData: null },
  });
  try {
    const { data } = yield postLogin(payload.body);
    yield put({ type: actions.SET_STATE, payload: { authData: data } });
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
    console.log(error.response.data);
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

// export function* LOGOUT() {
//   localStorage.clear();
//   yield put({ type: actions.SET_STATE, payload: { authData: null } });
// }

export function* SET_MENU_DATA(payload) {
  console.log("asdad - payload", payload?.body);
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, menuData: payload?.body },
  });
}

export default function* authSaga() {
  yield all([takeEvery(actions.POST_LOGIN, POST_LOGIN)]);
  yield all([takeEvery(actions.SET_MENU_DATA, SET_MENU_DATA)]);
  // yield all([takeEvery(actions.LOGOUT, LOGOUT)]);
}
