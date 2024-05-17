import { all, put, takeEvery } from "redux-saga/effects";
import {
  postQueueRequest,
  getQueueList,
  getQueueGroup,
  approveQueue,
  rejectQueue,
  pourOutBucket,
} from "@/services/queueRequest";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "@/components/Notification/MessageSuccess";
import moment from "moment";
import MessageError from "@/components/Notification/MessageError";

export function* GET_QUEUE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getQueueList(payload?.param);

    yield put({ type: actions.SET_STATE, payload: { queueList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_QUEUE_GROUP(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getQueueGroup(payload.param);

    yield put({ type: actions.SET_STATE, payload: { queueGroup: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* POST_QUEUE_REQUEST(payload) {
  const { body, onFinishSaga, onSuccessSaga } = payload?.param;
  try {
    const { data } = yield postQueueRequest(body);
    if (data.status === 200) {
      yield put({ type: actions.SET_STATE, payload: { loading: true } });
      toast.success(<MessageSuccess msg={"Antrian berhasil ditambahkan"} />, {
        className: "toast-message-success",
      });
      if (onSuccessSaga) onSuccessSaga();
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      { className: "toast-message-error" }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* APPROVE_QUEUE(payload) {
  const { body, onFinishSaga } = payload?.param;
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const newBody = {
      queue_data: body?.list?.map((e) => ({
        id: e.queue_id,
        request_quantity: e.quantity_bucket,
      })),
      coordinator_code: body?.code,
      scheduled_arrival_date: body?.date || moment().locale("id").add(1, "day"),
      accum_bucket: body?.accumBucket,
    };
    const { _ } = yield approveQueue(newBody);
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      { className: "toast-message-error" }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    toast.success(<MessageSuccess msg={"Antrian sukses diterima"} />, {
      className: "toast-message-success",
    });
    if (onFinishSaga) onFinishSaga();
  }
}

export function* REJECT_QUEUE(payload) {
  const { body, onFinishSaga } = payload?.param;
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const newBody = {
      queue_data: body?.list?.map((e) => ({
        id: e.queue_id,
      })),
    };
    const { _ } = yield rejectQueue(newBody);
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
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );
    if (onFinishSaga) {
      onFinishSaga(true);
    }
  }
}

export function* POUR_OUT_BUCKET(payload) {
  const { body, onSuccess, onFinishSaga } = payload?.param;
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield pourOutBucket(body);
    if (data?.status === 200) {
      yield put({ type: actions.SET_STATE, payload: { pourOutRes: data } });
      if (
        data.data[0].current_status ===
        ("ALREADY_REJECTED" || "ALREADY_APPROVED")
      ) {
        toast.error(<MessageError msg={"Terjadi Kesalahan"} />, {
          className: "toast-message-error",
        });
      } else {
        toast.success(<MessageSuccess msg={"Sukses"} />, {
          className: "toast-message-success",
        });
      }

      onSuccess(data.data[0]);
    }
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      { className: "toast-message-error" }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    if (onFinishSaga) {
      onFinishSaga();
    }
  }
}

// export function* PUT_PROFIL_LIST(payload) {
//   yield put({ type: actions.SET_STATE, payload: { loading: true}});
//   try {
//     const { data } = yield editProfitTakingDictionary(payload.param.body);
//     if (data.status === 200) {
//       try {
//         const { data } = yield getListProfitTakingDictionary(payload.param.params);
//         yield put({ type: actions.SET_STATE, payload: { profitData: data } });
//       } catch ({ message: error }) {
//         yield put({ type: actions.SET_STATE, payload: { error } });
//       } finally {
//         yield put({ type: actions.SET_STATE, payload: { loading: false } });
//         toast.success(<MessageSuccess  msg={'You have successfully edited an item'}/>, {
//           className: 'toast-message-success'
//         });
//         payload.param.setIsModalOpen(false)
//       }
//     }
//   } catch (error) {
//     yield put({ type: actions.SET_STATE, error: error.response.data });
//   } finally {
//     yield put({ type: actions.SET_STATE, payload: { loading: false } });
//   }

// }

// export function* DELETE_PROFIT_LIST(payload) {
//   const { data } = yield deleteProfitTakingDictionary(payload.param.id);
//   if (data.status === 200) {
//     yield put({ type: actions.SET_STATE, payload: { loading: true } });
//     try {
//       const { data } = yield getListProfitTakingDictionary(payload.param.params);
//       yield put({ type: actions.SET_STATE, payload: { profitData: data } });
//     } catch ({ message: error }) {
//       yield put({ type: actions.SET_STATE, payload: { error } });
//     } finally {
//       yield put({ type: actions.SET_STATE, payload: { loading: false } });
//       toast.success(<MessageSuccess  msg={'You have successfully deleted an item'}/>, {
//         className: 'toast-message-success'
//       });
//       payload.param.setIsModalOpen(false)
//     }
//   }
// }

export default function* queueRequestSaga() {
  yield all([
    takeEvery(actions.POST_DATA, POST_QUEUE_REQUEST),
    takeEvery(actions.GET_DATA, GET_QUEUE_LIST),
    takeEvery(actions.GET_QUEUE_GROUP, GET_QUEUE_GROUP),
    takeEvery(actions.APPROVE_QUEUE, APPROVE_QUEUE),
    takeEvery(actions.REJECT_QUEUE, REJECT_QUEUE),
    takeEvery(actions.POUR_OUT_BUCKET, POUR_OUT_BUCKET),
    // takeEvery(actions.PUT_DATA, PUT_PROFIL_LIST),
    // takeEvery(actions.DELETE_DATA, DELETE_PROFIT_LIST)
  ]);
}
