import { all, call, put, takeEvery } from "redux-saga/effects";
import {
  getListGradeDictionary,
  postGradeDictionary,
  editGradeDictionary,
  deleteGradeDictionary,
} from "@/services/gradeManagement";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* GET_GRADE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getListGradeDictionary(payload.param);

    yield put({ type: actions.SET_STATE, payload: { gradeData: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* CREATE_GRADE(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;
  try {
    yield put({ type: actions.SET_STATE, payload: { loading: true } });
    const { data } = yield postGradeDictionary(body);

    if (data.status === 200) {
      if (onSuccessSaga) onSuccessSaga(data?.data);
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(<MessageError msg={`Error: ${error}`} />, {
      className: "toast-message-error",
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* UPDATE_GRADE(payload) {
  const newPayload = {
    id: payload.param.body.id,
    price: payload.param.body.price,
    client_grade: payload.param.body?.grade,
    grade_initial: payload.param.body.grade_initial,
    client_id: payload.param.body.client_id,
    quota: payload.param.body.quota,
  };
  const { data } = yield editGradeDictionary(newPayload);
  if (data.status === 200) {
    yield put({ type: actions.SET_STATE, payload: { loading: true } });
    try {
      const { data } = yield getListGradeDictionary(payload.param.params);
      yield put({ type: actions.SET_STATE, payload: { gradeData: data } });
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
      payload.param.setBody({});
    }
  }
}

export function* DELETE_GRADE(payload) {
  const { data } = yield call(deleteGradeDictionary, payload.param.id);
  if (data.status === 200) {
    yield put({ type: actions.SET_STATE, payload: { loading: true } });
    try {
      const { data } = yield getListGradeDictionary(payload.param.params);
      yield put({ type: actions.SET_STATE, payload: { gradeData: data } });
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

export default function* gradeDictionarySaga() {
  yield all([
    takeEvery(actions.GET_GRADE_LIST, GET_GRADE_LIST),
    takeEvery(actions.CREATE_GRADE, CREATE_GRADE),
    takeEvery(actions.DELETE_GRADE, DELETE_GRADE),
    takeEvery(actions.UPDATE_GRADE, UPDATE_GRADE),
  ]);
}
