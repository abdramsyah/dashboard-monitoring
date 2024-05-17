import { all, put, takeEvery } from "redux-saga/effects";
import {
  bulkScanInBarcode,
  bulkScanOutBarcode,
  getListBarcodeSystems,
} from "@/services/barcodeSystem";
import {
  getASEByCompanyBarcode,
  insertClientBarcode,
} from "@/services/weightInformationEntry";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* SCAN_IN_BARCODE_LIST(payload) {
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

export function* SCAN_OUT_BARCODE_LIST(payload) {
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

export function* SCAN_CLIENT_BARCODE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });

  try {
    const { client_barcode, id, company_barcode } = payload.param;
    // eslint-disable-next-line no-unused-vars
    const { data: dataPost } = yield insertClientBarcode({
      client_barcode,
      id,
    });
    const { data } = yield getASEByCompanyBarcode({
      company_barcode,
    });
    yield put({
      type: actions.SET_STATE,
      payload: { aseData: data?.data },
    });
    toast.success(
      <MessageSuccess msg={"You have successfully added client barcode"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    return toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* SCAN_COMPANY_BARCODE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });

  try {
    // eslint-disable-next-line no-unused-vars
    const { data } = yield getASEByCompanyBarcode({
      ...payload.param,
    });
    yield put({
      type: actions.SET_STATE,
      payload: { aseData: data?.data },
    });
    toast.success(<MessageSuccess msg={"You have successfully get data"} />, {
      className: "toast-message-success",
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    return toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

function* SET_SCAN_MODE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { scanDesc: payload.param },
  });
}

export default function* barcodeScannerSaga() {
  yield all([
    takeEvery(actions.SCAN_IN, SCAN_IN_BARCODE_LIST),
    takeEvery(actions.SCAN_OUT, SCAN_OUT_BARCODE_LIST),
    takeEvery(actions.SCAN_CLIENT_BARCODE, SCAN_CLIENT_BARCODE),
    takeEvery(actions.SCAN_COMPANY_BARCODE, SCAN_COMPANY_BARCODE),
    takeEvery(actions.SCAN_MODE, SET_SCAN_MODE),
  ]);
}
