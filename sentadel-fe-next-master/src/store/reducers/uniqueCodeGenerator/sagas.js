import { all, put, takeEvery } from "redux-saga/effects";
import {
  validateAndBurn,
  validateUniqueCode,
  getListUniqueCodeGenerator,
  postUniqueCodeGenerator,
} from "@/services/uniqueCodeGenerator";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* GET_CODE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  try {
    const { data } = yield getListUniqueCodeGenerator(payload.param);

    yield put({ type: actions.SET_STATE, payload: { uniqueCode: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* POST_CODE_LIST(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });
  try {
    const { data } = yield postUniqueCodeGenerator();
    if (data.status === 200) {
      try {
        const { data: newData } = yield getListUniqueCodeGenerator(
          payload.param
        );
        yield put({
          type: actions.SET_STATE,
          payload: { uniqueCode: newData },
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
        payload.param.setIsModalOpen(false);
      }
    }
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* VALIDATE_UNIQUE_CODE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  const { uniqueCode, onFinished } = payload.param;

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: _ } = yield validateUniqueCode({
      code: uniqueCode,
    });

    if (onFinished) onFinished(true);

    toast.success(<MessageSuccess msg={"Your unique code was valid"} />, {
      className: "toast-message-success",
    });
  } catch ({ message: error }) {
    if (onFinished) onFinished(false);

    toast.error(<MessageError msg={"Your unique code was invalid"} />, {
      className: "toast-message-error",
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* VALIDATE_AND_BURN(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });
  const { uniqueCode, onFinished } = payload.param;

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: _ } = yield validateAndBurn({ code: uniqueCode });

    if (onFinished) onFinished(true);

    toast.success(
      <MessageSuccess msg={"Your unique code was valid and alrady burn"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    if (onFinished) onFinished(false);

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

export default function* uniqueCodeGeneratorSaga() {
  yield all([
    takeEvery(actions.GET_DATA, GET_CODE_LIST),
    takeEvery(actions.POST_DATA, POST_CODE_LIST),
    takeEvery(actions.VALIDATE, VALIDATE_UNIQUE_CODE),
    takeEvery(actions.VALIDATE_AND_BURN, VALIDATE_AND_BURN),
  ]);
}
