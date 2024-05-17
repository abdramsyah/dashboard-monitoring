import { all, put, takeEvery } from "redux-saga/effects";
import {
  addNewCoordinator,
  deleteCoordinator,
  getCoordinatorPerforma,
  getListCoordinatorManagement,
  updateCoordinator,
} from "@/services/coordinatorManagement";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import actions from "./actions";
import MessageError from "@/components/Notification/MessageError";

export function* GET_COORDINATOR_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getListCoordinatorManagement(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { coordinatorData: data, action: actions.GET_COORDINATOR_LIST },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* ADD_NEW_COORDINATOR(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;

  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield addNewCoordinator(body);

    if (data?.status === 200) {
      toast.success(
        <MessageSuccess msg={"Koordinator berhasil ditambahkan"} />,
        {
          className: "toast-message-success",
        }
      );

      if (onSuccessSaga) onSuccessSaga();
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* DELETE_COORDINATOR(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { status } = yield deleteCoordinator(payload.param.id);
    if (status === 200) {
      toast.success(
        <MessageSuccess msg={"You have successfully delete the Coordinator"} />,
        {
          className: "toast-message-success",
        }
      );
      yield put({ type: actions.SET_STATE });
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* UPDATE_COORDINATOR(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;

  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield updateCoordinator(body?.coordinator_param);
    if (data?.status === 200) {
      if (onSuccessSaga) onSuccessSaga();
      toast.success(
        <MessageSuccess msg={"You have successfully update the Coordinator"} />,
        {
          className: "toast-message-success",
        }
      );
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* GET_COORDINATOR_PERFORMANCE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getCoordinatorPerforma(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { coordinatorPerformance: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export default function* coordinatorManagementSaga() {
  yield all([
    takeEvery(actions.GET_COORDINATOR_LIST, GET_COORDINATOR_LIST),
    takeEvery(actions.CREATE_COORDINATOR, ADD_NEW_COORDINATOR),
    takeEvery(actions.DELETE_COORDINATOR, DELETE_COORDINATOR),
    takeEvery(actions.UPDATE_COORDINATOR, UPDATE_COORDINATOR),
    takeEvery(actions.GET_COORDINATOR_PERFORMANCE, GET_COORDINATOR_PERFORMANCE),
  ]);
}
