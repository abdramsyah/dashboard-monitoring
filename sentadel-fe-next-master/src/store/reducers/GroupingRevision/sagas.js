import { all, put, takeEvery } from "redux-saga/effects";
import {
  getListGrouping,
  postGroupingRepision,
  putGroupingRepision,
  getFinalGoods,
  getDetailGrouping,
  rejectAndChangeGrade,
} from "@/services/GroupingRevision";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* GET_LIST_GROUPING(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingGrouping: true } });

  try {
    const { data } = yield getListGrouping(payload.param);
    console.log("data grop list", data);

    yield put({ type: actions.SET_STATE, payload: { GroupingList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingGrouping: false } });
  }
}

export function* EXPORT_DATA_GROUPING(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingGrouping: true } });

  try {
    const { data } = yield getFinalGoods({
      ...payload.param,
      limit: null,
      page: null,
    });

    yield put({ type: actions.SET_STATE, payload: { exDataGrouping: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingGrouping: false } });
  }
}

export function* GET_DETAIL_GROUPING(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingDetailGrouping: true },
  });

  try {
    const { data } = yield getDetailGrouping(payload.param);

    yield put({ type: actions.SET_STATE, payload: { detailGrouping: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingDetailGrouping: false },
    });
  }
}

export function* GET_FINALS_GOODS_GROUPING(payload) {
  const clientId = payload?.param?.Client
    ? payload?.param?.Client?.data_client?.id
    : payload?.param?.item?.client_id;
  const params = {
    ...payload.param.params,
    filter: "client_id:" + clientId,
  };

  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getFinalGoods(
      clientId === undefined ? payload.param.params : params
    );

    yield put({ type: actions.SET_STATE, payload: { finalGoods: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* POST_GROUPING(payload) {
  let goods_information_id = [];
  payload?.param.dataClient.map((item, key) =>
    goods_information_id.push(item.id)
  );
  const body = {
    idClient: payload.param.Client.data_client.id,
    goods_information_id: goods_information_id,
    client_code: payload.param.Client.data_client.code,
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loadingGrouping: true, GroupingList: null },
  });

  try {
    // eslint-disable-next-line no-unused-vars
    const { dataPost } = yield postGroupingRepision(body);

    const { data } = yield getListGrouping(payload.param.params);
    yield put({ type: actions.SET_STATE, payload: { GroupingList: data } });
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
      // className: 'toast-message-success'
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingGrouping: false } });
    payload.param.setIsGroupingOpen(false);
    payload.param.setKonfirmationModal(false);
    payload.param.setBody({});
    // clear key selected  data
    // clear selected data
    payload.param.setDataClient([]);
  }
}

export function* PUT_GROUPING(payload) {
  console.log("sagas put", payload);
  let goods_information_id = [];
  payload?.param.dataClient.map((item, key) =>
    goods_information_id.push(item.id)
  );

  const body = {
    idClient: payload.param.idGrouping,
    goods_information_id: goods_information_id,
    unique_code: payload.param.unique_code,
  };

  yield put({ type: actions.SET_STATE, payload: { loadingGrouping: true } });
  try {
    yield putGroupingRepision(body);

    const { data } = yield getListGrouping(payload.param.params);
    yield put({ type: actions.SET_STATE, payload: { GroupingList: data } });
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    // toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
    //   // className: 'toast-message-success'
    // });
    console.log(error);
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingGrouping: false } });
    payload.param.setKonfirmationModal(false);
    payload.param.setIsGroupingOpen(false);
    payload.param.setBody({});
  }
}

export function* REJECT_AND_CHANGE_GRADE(payload) {
  console.log("rejectchangegrade - payload", payload);

  const body = () => {
    const objectArray = Object.entries(payload.param.payload);
    console.log("rejectchangegrade - objectArray", objectArray);

    return objectArray.map(([_, e]) => ({
      goods_id: e.goods_id,
      grade_id: e.new_grade_id,
      status: e.status,
    }));
  };

  yield put({ type: actions.SET_STATE, payload: { loadingGrouping: true } });
  try {
    yield rejectAndChangeGrade({
      revision_goods: body(),
      unique_code: payload.param.unique_code,
    });

    const { data } = yield getListGrouping(payload.param.params);
    yield put({ type: actions.SET_STATE, payload: { GroupingList: data } });
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingGrouping: false } });
    payload.param.setKonfirmationModal(false);
    payload.param.setIsGroupingOpen(false);
    payload.param.setBody({});
  }
}

export default function* groupingRevisionSagas() {
  yield all([
    takeEvery(actions.POST_DATA, POST_GROUPING),
    takeEvery(actions.PUT_DATA, PUT_GROUPING),
    takeEvery(actions.GET_DETAIL_GROUPING, GET_DETAIL_GROUPING),
    takeEvery(actions.GET_LIST_GROUPING, GET_LIST_GROUPING),
    takeEvery(actions.GET_GOODS_GROUPING, GET_FINALS_GOODS_GROUPING),
    takeEvery(actions.EXPORT_DATA_GROUPING, EXPORT_DATA_GROUPING),
    takeEvery(actions.REJECT_AND_CHANGE_GRADE, REJECT_AND_CHANGE_GRADE),
  ]);
}
