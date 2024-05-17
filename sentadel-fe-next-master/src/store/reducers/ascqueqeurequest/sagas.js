import { all, put, takeEvery } from "redux-saga/effects";
import {
  getListAscQuequeRequest,
  postAscQuequeRequest,
} from "@/services/ascQueqeuRequest";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";

export function* GET_ASC_QUEQUE_REQUEST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getListAscQuequeRequest(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { ascQuequeRequestData: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* CHANGE_STATUS(payload) {
  console.log("barcode - payload.param.body", payload.param);
  const { data } = yield postAscQuequeRequest(payload.param.body);
  const msg = payload.param.body.status === "REJECTED" ? "Ditolak" : "Diterima";
  if (data.status === 200) {
    yield put({ type: actions.SET_STATE, payload: { loading: true } });
    try {
      const { data } = yield getListAscQuequeRequest(payload.param.params);
      yield put({
        type: actions.SET_STATE,
        payload: { ascQuequeRequestData: data },
      });
    } catch ({ message: error }) {
      yield put({ type: actions.SET_STATE, payload: { error } });
    } finally {
      yield put({ type: actions.SET_STATE, payload: { loading: false } });
      toast.success(
        <MessageSuccess msg={`You have successfully mark queue as ${msg}`} />,
        {
          className: "toast-message-success",
        }
      );
      payload.param.setIsModalOpen(false);
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

export default function* ascQuequeRequestSaga() {
  yield all([
    takeEvery(actions.POST_DATA, CHANGE_STATUS),
    takeEvery(actions.GET_DATA, GET_ASC_QUEQUE_REQUEST),
    // takeEvery(actions.PUT_DATA, PUT_PROFIL_LIST),
    // takeEvery(actions.DELETE_DATA, DELETE_PROFIT_LIST)
  ]);
}
