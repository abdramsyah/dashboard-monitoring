import { all, put, takeEvery } from "redux-saga/effects";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import {
  getListGoodsInformation,
  getSingleGoodsInformation,
  markGoodsAsApproved,
  reviseFinalGoods,
} from "@/services/goodsInformation";

export function* GET_PURCHASING_INFORMATION_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getListGoodsInformation(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { goodInformationList: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_PURCHASING_INFORMATION_DATA(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getSingleGoodsInformation(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { goodInformationData: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* MARK_GOODS_AS_APPROVED(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { status } = yield markGoodsAsApproved({ id: payload.param.body.id });
    if (status === 200) {
      toast.success(
        <MessageSuccess msg={"You have successfully added the item"} />,
        {
          className: "toast-message-success",
        }
      );
      const { data } = yield getListGoodsInformation(payload.param.params);
      yield put({
        type: actions.SET_STATE,
        payload: { goodInformationList: data },
      });
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
      // className: 'toast-message-success'
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    payload.param.setIsModalOpen(false);
  }
}

export function* REVISE_FINAL_GOODS(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  const newParams = {
    id: payload?.param?.body?.id,
    gross_weight:
      payload?.param?.body?.dataWeight?.gross_weight ||
      payload?.param?.body?.gross_weight / 1000,
    grade_id:
      payload?.param?.body?.dataGrade?.id || payload?.param?.body?.grade_id,
    client_id:
      payload?.param?.body?.data_client?.id || payload?.param?.body?.client_id,
    profit_taking_id:
      payload?.param?.body?.dataProfit?.id ||
      payload?.param?.body?.profit_taking_id,
    unique_code: payload?.param?.body?.unique_code,
  };

  console.log("updateASE - payload", payload);

  try {
    const { status } = yield reviseFinalGoods(newParams);
    if (status === 200) {
      toast.success(
        <MessageSuccess msg={"You have successfully added the item"} />,
        {
          className: "toast-message-success",
        }
      );
      const { data } = yield getListGoodsInformation(payload.param.params);
      yield put({
        type: actions.SET_STATE,
        payload: { goodInformationList: data },
      });
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    // toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
    //   // className: 'toast-message-success'
    // });
    console.log(error);
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    payload?.param?.setIsModalOpen(false);
  }
}

export default function* purchasingSaga() {
  yield all([
    takeEvery(
      actions.GET_PURCHASING_INFORMATION_LIST,
      GET_PURCHASING_INFORMATION_LIST
    ),
    takeEvery(
      actions.GET_PURCHASING_INFORMATION_DATA,
      GET_PURCHASING_INFORMATION_DATA
    ),
    takeEvery(actions.MARK_GOODS_AS_APPROVED, MARK_GOODS_AS_APPROVED),
    takeEvery(actions.REVISE_FINAL_GOODS, REVISE_FINAL_GOODS),
  ]);
}
