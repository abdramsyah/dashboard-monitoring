import { all, put, takeEvery } from "redux-saga/effects";
import {
  bulkScanInBarcode,
  bulkScanOutBarcode,
  createBarcodeSales,
  getAdminList,
  getBarcodeSales,
  getListBarcodeSystems,
  postBulkBarcodesSystem,
} from "@/services/barcodeSystem";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import MessageError from "@/components/Notification/MessageError";

export function* GET_BARCODE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getListBarcodeSystems(payload.param);
    yield put({ type: actions.SET_STATE, payload: { barcodeSystem: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* POST_BARCODE_LIST(payload) {
  const { data } = yield postBulkBarcodesSystem(payload.param.body);
  if (data.status === 200) {
    yield put({ type: actions.SET_STATE, payload: { loading: true } });
    try {
      const { data } = yield getListBarcodeSystems(payload.param.params);
      yield put({ type: actions.SET_STATE, payload: { barcodeSystem: data } });
    } catch ({ message: error }) {
      yield put({ type: actions.SET_STATE, payload: { error } });
    } finally {
      yield put({ type: actions.SET_STATE, payload: { loading: false } });
      toast.success(
        <MessageSuccess msg={"You have successfully added the item"} />,
        {
          className: "toast-message-success",
        }
      );
      payload.param.setIsModalOpen(false);
    }
  }
}

export function* PUT_IN_BARCODE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield bulkScanInBarcode(payload.param);
    if (data.status === 200) {
      data.data.map((e) => {
        if (e.scan_status === "SUCCESS")
          return toast.success(
            <MessageSuccess msg={`${e.barcode} is ${e.scan_status}`} />,
            {
              className: "toast-message-success",
            }
          );

        return toast.error(
          <MessageError msg={`${e.barcode} is ${e.scan_status}`} />,
          {
            className: "toast-message-error",
          }
        );
      });
      console.log("PUT_BARCODE_LIST - data", data);
      if (payload.param.params) {
        try {
          const { data } = yield getListBarcodeSystems(payload.param.params);
          yield put({
            type: actions.SET_STATE,
            payload: { barcodeSystem: data },
          });
        } catch ({ message: error }) {
          yield put({ type: actions.SET_STATE, payload: { error } });
        } finally {
          yield put({ type: actions.SET_STATE, payload: { loading: false } });
          toast.success(
            <MessageSuccess msg={"You have successfully edited an item"} />,
            {
              className: "toast-message-success",
            }
          );
        }
      }
    }
  } catch (error) {
    console.log("PUT_BARCODE_LIST - error", error);
    yield put({ type: actions.SET_STATE, error: error?.response?.data });
    if (error?.response?.data?.data) {
      error.response.data.data.map((e, i) =>
        toast.error(<MessageError msg={`${e.barcode} is ${e.scan_status}`} />, {
          className: "toast-message-error",
        })
      );
    }
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* PUT_OUT_BARCODE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield bulkScanOutBarcode(payload.param);
    if (data.status === 200) {
      data.data.map((e) => {
        if (e.scan_status === "SUCCESS")
          return toast.success(
            <MessageSuccess msg={`${e.barcode} is ${e.scan_status}`} />,
            {
              className: "toast-message-success",
            }
          );

        return toast.error(
          <MessageError msg={`${e.barcode} is ${e.scan_status}`} />,
          {
            className: "toast-message-error",
          }
        );
      });
      console.log("PUT_BARCODE_LIST - data", data);
      if (payload.param.params) {
        try {
          const { data } = yield getListBarcodeSystems(payload.param.params);
          yield put({
            type: actions.SET_STATE,
            payload: { barcodeSystem: data },
          });
        } catch ({ message: error }) {
          yield put({ type: actions.SET_STATE, payload: { error } });
        } finally {
          yield put({ type: actions.SET_STATE, payload: { loading: false } });
          toast.success(
            <MessageSuccess msg={"You have successfully edited an item"} />,
            {
              className: "toast-message-success",
            }
          );
        }
      }
    }
  } catch (error) {
    console.log("PUT_BARCODE_LIST - error", error);
    yield put({ type: actions.SET_STATE, error: error?.response?.data });
    if (error?.response?.data?.data) {
      error.response.data.data.map((e, i) =>
        toast.error(<MessageError msg={`${e.barcode} is ${e.scan_status}`} />, {
          className: "toast-message-error",
        })
      );
    }
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

function* SET_SCAN_MODE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { isScannedIn: payload.param },
  });
}

export function* CREATE_BARCODE_SELLING(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;

  try {
    const { data } = yield createBarcodeSales(body);

    if (data?.status === 200) onSuccessSaga(data?.data);
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    toast.success(<MessageSuccess msg={"Sukses membuat barcode"} />, {
      className: "toast-message-success",
    });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* GET_ADMIN_ENTRY(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getAdminList();

    yield put({ type: actions.SET_STATE, payload: { adminEntry: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(<MessageError msg={error?.response?.message ?? error} />, {
      className: "toast-message-error",
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    toast.success(<MessageSuccess msg={"Sukses"} />, {
      className: "toast-message-success",
    });
  }
}

export function* GET_BARCODE_SALES(payload) {
  const { params } = payload?.param;

  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getBarcodeSales(params);
    yield put({ type: actions.SET_STATE, payload: { barcodeSales: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(<MessageError msg={error?.response?.message ?? error} />, {
      className: "toast-message-error",
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    toast.success(<MessageSuccess msg={"Sukses"} />, {
      className: "toast-message-success",
    });
  }
}

export default function* barcodeSystemSaga() {
  yield all([
    takeEvery(actions.GET_DATA, GET_BARCODE_LIST),
    takeEvery(actions.POST_DATA, POST_BARCODE_LIST),
    takeEvery(actions.PUT_DATA, PUT_IN_BARCODE_LIST),
    takeEvery(actions.PUT_OUT_DATA, PUT_OUT_BARCODE_LIST),
    takeEvery(actions.SCAN_MODE, SET_SCAN_MODE),
    takeEvery(actions.GET_ADMIN_ENTRY, GET_ADMIN_ENTRY),
    takeEvery(actions.CREATE_BARCODE_SALES, CREATE_BARCODE_SELLING),
    takeEvery(actions.GET_BARCODE_SALES, GET_BARCODE_SALES),
  ]);
}
