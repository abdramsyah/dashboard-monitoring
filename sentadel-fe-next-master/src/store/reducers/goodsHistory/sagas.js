import { all, put, takeEvery } from "redux-saga/effects";
import actions from "./actions";
import { getGoodsHistory } from "@/services/goodsHistory";

export function* GET_GOODS_HISTORY(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getGoodsHistory(payload.param);

    yield put({ type: actions.SET_STATE, payload: { goodsHistoryData: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export default function* goodsHistorySaga() {
  yield all([takeEvery(actions.GET_GOODS_HISTORY, GET_GOODS_HISTORY)]);
}
