import { all, put, takeEvery } from "redux-saga/effects";
import { getListRoles } from "@/services/userRoles";
import actions from "./actions";

export function* GET_ROLES_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getListRoles(payload.param);
    yield put({ type: actions.SET_STATE, payload: { rolesData: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* SET_SELECTED_ROLE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { selectedRole: payload.param },
  });
}

export default function* userRolesSaga() {
  yield all([takeEvery(actions.GET_DATA, GET_ROLES_LIST)]);
  yield all([takeEvery(actions.SET_SELECTED_ROLE, SET_SELECTED_ROLE)]);
}
