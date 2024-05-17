import { all, put, takeEvery } from "redux-saga/effects";
import {
  getListWeightInformationEntry,
  getWeightCoordinator,
  getNetWeight,
  postWeightInformationEntry,
  putWeightInformationEntry,
  insertClientBarcode,
  getASEByCompanyBarcode,
} from "@/services/weightInformationEntry";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* GET_WEIGHT_INFORMATION(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getListWeightInformationEntry(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { weightInformationEntryData: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_COORDINATOR_DROPDOWN() {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingWeightCoordinator: true },
  });

  try {
    const { data } = yield getWeightCoordinator();

    yield put({
      type: actions.SET_STATE,
      payload: { WeightCoordinatorDropdown: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingWeightCoordinator: false },
    });
  }
}

export function* GET_NET_WEIGHT(payload) {
  const body = {
    coordinator_id: payload.param.coordinator_id,
    gross_weight: payload.param.gross_weight,
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loadingNetWeight: true, netWeight: null },
  });
  try {
    const { data } = yield getNetWeight(body);
    console.log("data", data);
    yield put({ type: actions.SET_STATE, payload: { netWeight: data } });
    if (data.status === 200) {
      // setBody({ ...body, gross_weight: e.target.value.length ? parseInt(e.target.value) : e.target.value })
      payload.param.setBody({
        ...payload.param.body,
        net_weight: data.data.net_weight,
      });
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
    toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
      // className: 'toast-message-success'
    });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingNetWeight: false },
    });
  }
}

export function* POST_NET_WEIGHT(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });

  try {
    const { data: dataPost } = yield postWeightInformationEntry(payload.param);
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );

    if (payload.param.params.company_barcode) {
      const { data } = yield getASEByCompanyBarcode({
        company_barcode: payload.param.params.company_barcode,
      });
      yield put({
        type: "barcodeScanner/SET_STATE",
        payload: { aseData: data?.data },
      });
    } else {
      const { data } = yield getListWeightInformationEntry(
        payload.param.params
      );
      yield put({
        type: actions.SET_STATE,
        payload: { weightInformationEntryData: data },
      });
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
      // className: 'toast-message-success'
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* PUT_WEIGHT_INFO(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });

  try {
    const { data: dataPut } = yield putWeightInformationEntry(payload.param);
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );

    if (payload.param.params.company_barcode) {
      const { data } = yield getASEByCompanyBarcode({
        company_barcode: payload.param.params.company_barcode,
      });
      yield put({
        type: "barcodeScanner/SET_STATE",
        payload: { aseData: data?.data },
      });
    } else {
      const { data } = yield getListWeightInformationEntry(
        payload.param.params
      );
      yield put({
        type: actions.SET_STATE,
        payload: { weightInformationEntryData: data },
      });
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    return toast.error(<MessageError msg={error?.response?.data?.message} />, {
      className: "toast-message-error",
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* INSERT_CLIENT_BARCODE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });

  try {
    const { data: dataPost } = yield insertClientBarcode(payload.param);
    const { data } = yield getListWeightInformationEntry(payload.param.params);
    yield put({
      type: actions.SET_STATE,
      payload: { weightInformationEntryData: data },
    });
    toast.success(
      <MessageSuccess msg={"You have successfully added client barcode"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    return toast.error(<MessageError msg={error?.response?.data?.message} />, {
      className: "toast-message-error",
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export default function* goodsInformationEntrySagas() {
  yield all([
    takeEvery(actions.POST_DATA, POST_NET_WEIGHT),
    takeEvery(actions.PUT_DATA, PUT_WEIGHT_INFO),
    takeEvery(actions.GET_DATA, GET_WEIGHT_INFORMATION),
    takeEvery(actions.GET_WEIGHT_COORDINATOR, GET_COORDINATOR_DROPDOWN),
    takeEvery(actions.GET_NET_WEIGHT, GET_NET_WEIGHT),
    takeEvery(actions.INSERT_CLIENT_BARCODE, INSERT_CLIENT_BARCODE),
  ]);
}
