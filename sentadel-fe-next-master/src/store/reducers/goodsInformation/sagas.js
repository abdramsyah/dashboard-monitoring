import { all, put, takeEvery } from "redux-saga/effects";
import {
  getListGoodsInformationEntry,
  postGoodsInformationEntry,
  getCoordinatorDropdown,
  getClientDropdown,
  getProfitDropdown,
  getGradePrice,
  getListBucket,
  updateGoodsInformationEntry,
  rejectGoodsInformationEntry,
  rejectBuckets,
} from "@/services/goodsInformationEntry";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* GET_GOODS_INFORMATION(payload) {
  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getListGoodsInformationEntry(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { goodInformationEntryData: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_LIST_BUCKET(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingBucket: true } });

  try {
    const { data } = yield getListBucket(payload.param);

    yield put({
      type: actions.SET_STATE,
      payload: { bucketList: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingBucket: false } });
  }
}

export function* GET_COORDINATOR_DROPDOWN() {
  yield put({ type: actions.SET_STATE, payload: { loadingCoordinator: true } });

  try {
    const { data } = yield getCoordinatorDropdown();

    yield put({
      type: actions.SET_STATE,
      payload: { CoordinatorDropdown: data },
    });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_CLIENT_DROPDOWN() {
  yield put({ type: actions.SET_STATE, payload: { loadingClient: true } });

  try {
    const { data } = yield getClientDropdown({
      filter: "clients.deleted_at:NULL",
    });

    yield put({ type: actions.SET_STATE, payload: { clientDropdown: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingClient: false } });
  }
}

export function* GET_PROFIT_DROPDOWN() {
  yield put({
    type: actions.SET_STATE,
    payload: { laodingProfitlaodingProfit: true },
  });

  try {
    const { data } = yield getProfitDropdown();
    yield put({ type: actions.SET_STATE, payload: { profitDropdown: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { laodingProfit: false } });
  }
}

export function* BULK_CREATE_GOODS_INFO(payload) {
  const barcode_ids = payload?.selectedData.map((e) => e.barcode_id);
  const body = {
    grade_id: payload.param.dataGrade.id,
    client_id: payload.param.data_client.id,
    barcode_ids,
    profit_taking_id: payload.param.dataProfit.id,
    price: payload.param.dataGrade.price,
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, goodInformationEntryData: null },
  });

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: dataPost } = yield postGoodsInformationEntry(body);

    if (dataPost && dataPost?.length) {
      dataPost.forEach((e) => {
        return toast.error(
          <MessageError
            msg={`Bucket dengan company Barcode ${e.company_barcode} sudah diinput`}
          />,
          {
            className: "toast-message-error",
          }
        );
      });
    }

    const { data } = yield getListGoodsInformationEntry(payload.listParamsGood);
    yield put({
      type: actions.SET_STATE,
      payload: { goodInformationEntryData: data },
    });
    toast.success(
      <MessageSuccess msg={"You have successfully added the item"} />,
      {
        className: "toast-message-success",
      }
    );
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    return toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });

    payload.setIsModalOpen(false);
    payload.setPreview(false);
    payload.setBody({});
    payload.setSelectedData([]);
  }
}

export function* GET_GRADE_PRICE(payload) {
  const body = {
    client_id: payload.param.client_id,
    grade_id: payload.param.grade_id,
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, gradePrice: null },
  });
  try {
    const { data } = yield getGradePrice(body);

    yield put({ type: actions.SET_STATE, payload: { gradePrice: data } });
  } catch (error) {
    yield put({ type: actions.SET_STATE, error: error.response.data });
    toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
      // className: 'toast-message-success'
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* UPDATE_GOODS_DATA(payload) {
  console.log("payload", payload);
  const newParams = {
    id: payload?.param?.body?.id,
    gross_weight:
      payload?.param?.body?.dataWeight?.gross_weight ||
      payload?.param?.body?.gross_weight / 1000,
    grade_id:
      payload?.param?.body?.dataGrade?.id || payload?.param?.body?.grade_id,
    client_id:
      payload?.param?.body?.data_client?.id || payload?.param?.body?.client_id,
    profit_taking_id:
      payload?.param?.body?.dataProfit?.id ||
      payload?.param?.body?.profit_taking_id,
    unique_code: payload?.param?.body?.unique_code,
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, goodInformationEntryData: null },
  });

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: dataPost } = yield updateGoodsInformationEntry(newParams);

    const { data } = yield getListGoodsInformationEntry(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { goodInformationEntryData: data },
    });
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

    payload.param.setIsModalOpen(false);
    payload.param.setBody({});
  }
}

export function* REJECT_GOODS_DATA(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true, goodInformationEntryData: null },
  });

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: dataPost } = yield rejectGoodsInformationEntry(
      payload?.param?.id
    );

    const { data } = yield getListGoodsInformationEntry(payload.param);
    yield put({
      type: actions.SET_STATE,
      payload: { goodInformationEntryData: data },
    });
    toast.success(
      <MessageSuccess msg={"You have successfully reject the item"} />,
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

    payload?.param?.setIsModalOpen(false);
    payload?.param?.setBody({});
  }
}

export function* REJECT_BUCKETS(payload) {
  console.log("payload", payload);
  yield put({
    type: actions.SET_STATE,
    payload: { loading: true },
  });
  const barcode_ids = payload.param?.selectedData?.map((e) => ({
    id: e.barcode_id,
  }));

  try {
    // eslint-disable-next-line no-unused-vars
    const { data } = yield rejectBuckets({ barcode_ids });
    toast.success(
      <MessageSuccess msg={"You have successfully reject the item"} />,
      {
        className: "toast-message-success",
      }
    );
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

    payload.param?.setIsModalOpen(false);
    payload.param?.setPreview(false);
    payload.param?.setBody({});
    payload.param?.setSelectedData([]);
  }
}

export default function* goodsInformationEntrySagas() {
  yield all([
    takeEvery(actions.POST_DATA, BULK_CREATE_GOODS_INFO),
    takeEvery(actions.GET_PRICE_GRADE, GET_GRADE_PRICE),
    takeEvery(actions.GET_LIST_BUCKET, GET_LIST_BUCKET),
    takeEvery(actions.GET_DATA, GET_GOODS_INFORMATION),
    takeEvery(actions.GET_DATA_COORDINATOR, GET_COORDINATOR_DROPDOWN),
    takeEvery(actions.GET_DATA_PROFIT, GET_PROFIT_DROPDOWN),
    takeEvery(actions.GET_DATA_CLIENT, GET_CLIENT_DROPDOWN),
    takeEvery(actions.UPDATE_DATA, UPDATE_GOODS_DATA),
    takeEvery(actions.REJECT_GOODS_DATA, REJECT_GOODS_DATA),
    takeEvery(actions.REJECT_BUCKETS, REJECT_BUCKETS),
  ]);
}
