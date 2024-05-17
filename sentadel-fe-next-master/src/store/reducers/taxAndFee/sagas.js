import { all, put, takeEvery } from "redux-saga/effects";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";
import {
  getFeeData,
  getTaxData,
  setNewFee,
  setNewTax,
} from "@/services/taxAndFee";

export function* SET_NEW_TAX(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data: dataPost } = yield setNewTax(payload.param.body);
    if (dataPost.status === 200) {
      const { data } = yield getTaxData(payload.param.params);
      yield put({
        type: actions.SET_STATE,
        payload: { taxData: data },
      });
      toast.success(
        <MessageSuccess msg={"You have successfully set new tax"} />,
        {
          className: "toast-message-success",
        }
      );
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error?.response?.data });
    toast.error(
      <MessageError
        msg={`Error: ${error?.response?.data?.message || error}`}
      />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* SET_NEW_FEE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data: dataPost } = yield setNewFee(payload.param.body);
    if (dataPost.status === 200) {
      const { data } = yield getFeeData(payload.param.params);
      yield put({
        type: actions.SET_STATE,
        payload: { feeData: data },
      });
      toast.success(
        <MessageSuccess msg={"You have successfully set new fee"} />,
        {
          className: "toast-message-success",
        }
      );
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error?.response?.data });
    toast.error(
      <MessageError
        msg={`Error: ${error?.response?.data?.message || error}`}
      />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_TAX_DATA(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getTaxData(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { taxData: data },
    });
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error?.response?.data });
    toast.error(
      <MessageError
        msg={`Error: ${error?.response?.data?.message || error}`}
      />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_FEE_DATA(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getFeeData(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { feeData: data },
    });
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error?.response?.data });
    toast.error(
      <MessageError
        msg={`Error: ${error?.response?.data?.message || error}`}
      />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export default function* taxAndFeeSagas() {
  yield all([
    takeEvery(actions.SET_NEW_TAX, SET_NEW_TAX),
    takeEvery(actions.SET_NEW_FEE, SET_NEW_FEE),
    takeEvery(actions.GET_TAX_LIST, GET_TAX_DATA),
    takeEvery(actions.GET_FEE_LIST, GET_FEE_DATA),
  ]);
}
