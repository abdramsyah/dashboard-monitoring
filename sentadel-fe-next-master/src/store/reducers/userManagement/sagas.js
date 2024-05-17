import { all, put, takeEvery } from "redux-saga/effects";
import {
  createUser,
  getUserList,
  editUserManagement,
  deleteUserManagement,
} from "@/services/userManagement";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "@/components/Notification/MessageError";

export function* GET_USER_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getUserList(payload.param);

    yield put({ type: actions.SET_STATE, payload: { userData: data } });
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

export function* CREATE_USER(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;

  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, authData: null },
  });

  try {
    const { data } = yield createUser(body);
    if (data?.status === 200) {
      if (onSuccessSaga) onSuccessSaga();
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
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

export function* UPDATE_USER(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;

  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield editUserManagement(body);
    if (data.status === 200) {
      if (onSuccessSaga) onSuccessSaga();
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* DELETE_USER_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const response = yield deleteUserManagement(payload.param.id);
    if (response.status === 200) {
      const { data } = yield getUserList(payload.param.params);
      yield put({ type: actions.SET_STATE, payload: { userData: data } });
    } ////
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
    toast.success(
      <MessageSuccess msg={"You have successfully deleted an item"} />,
      {
        className: "toast-message-success",
      }
    );
    payload.param.setIsModalOpen(false);
  }
}

export default function* userManagementSaga() {
  yield all([
    takeEvery(actions.GET_USER_LIST, GET_USER_LIST),
    takeEvery(actions.CREATE_USER, CREATE_USER),
    takeEvery(actions.UPDATE_USER, UPDATE_USER),
    takeEvery(actions.DELETE_DATA, DELETE_USER_LIST),
  ]);
}
