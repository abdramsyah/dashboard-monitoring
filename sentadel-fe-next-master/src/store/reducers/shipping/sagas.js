import { all, call, put, takeEvery } from "redux-saga/effects";
import {
  postShipping,
  markAsShip,
  getListShipping,
  getListAddress,
  getGroupingList,
  getDetailShipping,
} from "@/services/shipping";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";

export function* GET_LIST_SHIPPING(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getListShipping(payload.param);

    yield put({ type: actions.SET_STATE, payload: { shippingList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_DETAIL_SHIPPING(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingDetailShipping: true },
  });

  try {
    const { data } = yield getDetailShipping(payload.param);

    yield put({ type: actions.SET_STATE, payload: { detailShipping: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingDetailShipping: false },
    });
  }
}

export function* GET_LIST_ADDRESS(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingListAdress: true } });

  try {
    const { data } = yield getListAddress(payload?.param?.body?.client?.id);

    yield put({ type: actions.SET_STATE, payload: { listAdress: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingListAdress: false },
    });
  }
}

export function* GET_LIST_GROUPING(payload) {
  const clientId = payload?.param?.Client
    ? payload?.param?.Client?.client?.id
    : payload?.param?.item?.client_id;
  const params = {
    ...payload.param.params,
    filter: "client_id:" + clientId,
  };

  yield put({ type: actions.SET_STATE, payload: { loadingGrouping: true } });

  try {
    const { data } = yield getGroupingList(
      clientId === undefined ? payload.param.params : params
    );

    yield put({ type: actions.SET_STATE, payload: { listGrouping: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingGrouping: false } });
  }
}

export function* POST_SHIPPING(payload) {
  let client_group_id = [];
  payload?.param.dataClient.map((item, key) => client_group_id.push(item.id));

  const body = {
    idClient: payload.param.Client.client.id,
    address_id: payload.param.Client.address_id.id,
    client_code: payload.param.Client.client.code,
    goods_information_id: client_group_id,
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, finalGoods: null },
  });

  try {
    const { dataPost } = yield postShipping(body);

    const { data } = yield getListShipping(payload.param.paramsList);
    yield put({ type: actions.SET_STATE, payload: { shippingList: data } });
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
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    payload.param.setIsGroupingOpen(false);
    payload.param.setKonfirmationModal(false);
    payload.param.setBody({});
    payload.param.setDataClient([]);
    payload.param.setParams({
      ...payload.param.params,
      page: 1,
    });
  }
}

export function* MARK_AS_SHIPPING(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { dataPost } = yield markAsShip(payload.param.id);

    const { data } = yield getListShipping(payload.param.params);
    yield put({ type: actions.SET_STATE, payload: { shippingList: data } });
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
    console.log(error);
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
    payload.param.setMarkasShip(false);
  }
}

export default function* shippingSagas() {
  yield all([
    takeEvery(actions.GET_LIST_SHIPPING, GET_LIST_SHIPPING),
    takeEvery(actions.GET_DETAIL_SHIPPING, GET_DETAIL_SHIPPING),
    takeEvery(actions.GET_LIST_ADDRESS, GET_LIST_ADDRESS),
    takeEvery(actions.MARK_AS_SHIPPING, MARK_AS_SHIPPING),
    takeEvery(actions.GET_LIST_GROUPING, GET_LIST_GROUPING),
    takeEvery(actions.POST_DATA, POST_SHIPPING),
  ]);
}
