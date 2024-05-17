import { all, put, takeEvery } from "redux-saga/effects";
import { getDataLake } from "@/services/dataLake";
import actions from "./actions";

export function* GET_DATA_LAKE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getDataLake(payload.param);

    yield put({ type: actions.SET_STATE, payload: { dataLake: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* EXPORT_DATA_LAKE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getDataLake({
      ...payload.param,
      limit: null,
      page: null,
    });

    yield put({ type: actions.SET_STATE, payload: { exDataLake: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export default function* dataLakeSagas() {
  yield all([takeEvery(actions.GET_DATA_LAKE, GET_DATA_LAKE)]);
  yield all([takeEvery(actions.EXPORT_DATA_LAKE, EXPORT_DATA_LAKE)]);
}
