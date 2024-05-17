import { all, put, takeEvery } from "redux-saga/effects";
import {
  getListClientManagement,
  createClient,
  editClientManagament,
  deleteClientManagement,
  getSupplyPowerManagement,
  getRecapSupplyPowerManagement,
} from "@/services/clientManagement";
import MessageSuccess from "../../../components/Notification/MessageSuccess";

import { toast } from "react-toastify";
import actions from "./actions";

export function* GET_CLIENT_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getListClientManagement(payload.param);

    yield put({ type: actions.SET_STATE, payload: { clientData: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* CREATE_CLIENT(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;

  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield createClient(body);
    if (data?.status === 200) {
      if (onSuccessSaga) onSuccessSaga();
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) onFinishSaga();
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );
  }
}

export function* PUT_CLIENT_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield editClientManagament(payload.param.body);
    if (data.status === 200) {
      try {
        const { data } = yield getListClientManagement(payload.param.params);
        yield put({ type: actions.SET_STATE, payload: { clientData: data } });
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
        payload.param.setIsModalOpen(false);
      }
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* DELETE_CLIENT_LIST(payload) {
  const { data } = yield deleteClientManagement(payload.param.id);
  if (data.status === 200) {
    yield put({ type: actions.SET_STATE, payload: { loading: true } });
    try {
      const { data } = yield getListClientManagement(payload.param.params);
      yield put({ type: actions.SET_STATE, payload: { clientData: data } });
    } catch ({ message: error }) {
      yield put({ type: actions.SET_STATE, payload: { error } });
    } finally {
      yield put({ type: actions.SET_STATE, payload: { loading: false } });
      toast.success(
        <MessageSuccess msg={"You have successfully deleted an item"} />,
        {
          className: "toast-message-success",
        }
      );
      payload.param.setIsModalOpen(false);
    }
  }
}

export function* GET_SUPPLY_POWER_MANAGEMENT(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getSupplyPowerManagement(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { supplyPowerManagementData: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_RECAP_SUPPLY_POWER_MANAGEMENT(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getRecapSupplyPowerManagement(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { recap: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export default function* clientManagementSaga() {
  yield all([
    takeEvery(actions.GET_DATA, GET_CLIENT_LIST),
    takeEvery(actions.CREATE_CLIENT, CREATE_CLIENT),
    takeEvery(actions.PUT_DATA, PUT_CLIENT_LIST),
    takeEvery(actions.DELETE_DATA, DELETE_CLIENT_LIST),
    takeEvery(actions.GET_SPU, GET_SUPPLY_POWER_MANAGEMENT),
    takeEvery(actions.GET_SPR, GET_RECAP_SUPPLY_POWER_MANAGEMENT),
  ]);
}
