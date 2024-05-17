import { all, put, takeEvery } from "redux-saga/effects";
import {
  getListInvoice,
  getFinalGoods,
  postInvoiceList,
  MarkasPaid,
  changeInvoiceStatus,
  MarkasPaidCoordinator,
  getFinalGoodsSales,
  getDetailInvoice,
  putInvoiceList,
  printInvoice,
  getDetailRevisedInvoice,
  createInvoiceDiff,
  getInvoiceDiffDetail,
} from "@/services/invoiceList";
import actions from "./actions";
import { toast } from "react-toastify";
import MessageSuccess from "../../../components/Notification/MessageSuccess";
import MessageError from "../../../components/Notification/MessageError";

export function* GET_LIST_INVOICE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingInvoice: true } });

  try {
    const { data } = yield getListInvoice(payload.param);

    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
  }
}

export function* GET_DETAIL_INVOICE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingDetailInvoice: true },
  });

  try {
    const { data } = yield getDetailInvoice(payload.param);

    yield put({ type: actions.SET_STATE, payload: { detailInvoice: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingDetailInvoice: false },
    });
  }
}

export function* GET_DETAIL_REVISED_INVOICE(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingDetailInvoice: true },
  });

  try {
    const { data } = yield getDetailRevisedInvoice(payload.param);

    yield put({ type: actions.SET_STATE, payload: { detailInvoice: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingDetailInvoice: false },
    });
  }
}

export function* GET_FINALS_GOODS(payload) {
  const coordinatorId = payload?.param?.Client?.data_coordinator?.id;
  const params = {
    ...payload?.param?.params,
    filter: coordinatorId ? "coordinator_id:" + coordinatorId : [],
  };

  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getFinalGoods(params);

    console.log("asdasdad - data", data);

    yield put({ type: actions.SET_STATE, payload: { finalGoods: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* GET_FINALS_GOODS_SALES(payload) {
  const coordinatorId = payload?.param?.body?.data_coordinator?.id;
  const params = {
    ...payload?.param,
    filter: coordinatorId ? "coordinator_id:" + coordinatorId : [],
  };

  yield put({ type: actions.SET_STATE, payload: { loading: true } });

  try {
    const { data } = yield getFinalGoodsSales(params);

    yield put({ type: actions.SET_STATE, payload: { finalGoods: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loading: false } });
  }
}

export function* POST_GROUPING(payload) {
  const body = {
    idClient: payload.param.Client.data_coordinator.id,
    goods_information_id: payload?.param.dataClient.map((item) => item.id),
  };

  yield put({
    type: actions.SET_STATE,
    payload: { loadingInvoice: true, invoiceList: null },
  });

  try {
    const { data: postData } = yield postInvoiceList(body);

    if (postData?.data?.length) {
      postData?.data?.forEach((e) => {
        const companyBarcode = e?.company_barcode || "";

        return toast.error(
          <MessageError
            msg={`goods dengan company barcode ${companyBarcode} sudah dibuatkan invoice`}
          />,
          {
            className: "toast-message-error",
            autoClose: 10000,
          }
        );
      });
    } else {
      toast.success(
        <MessageSuccess msg={"You have successfully update invoice list"} />,
        {
          className: "toast-message-success",
        }
      );
    }

    const paramater = payload.param.params
      ? payload.param.params
      : payload.param.paramsList;

    const { data } = yield getListInvoice(paramater);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.warn(<MessageSuccess msg={error?.response?.data?.message} />, {
      // className: 'toast-message-success'
    });
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    payload.param.setIsGroupingOpen(false);
    payload.param.setKonfirmationModal(false);
    payload.param.setDataClient([]);
    payload.param.setParams({
      ...payload.param.params,
      page: 1,
    });
  }
}

export function* PUT_INVOICE_LIST(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingInvoice: true } });

  const paramater = payload.param.params
    ? payload.param.params
    : payload.param.paramsList;

  try {
    let body = {
      goods_information_id: [],
      unique_code: null,
    };
    if (payload?.param?.body && payload?.param?.body?.length) {
      body = {
        goods_information_id: payload?.param?.body?.map((e) => e.id),
        unique_code: payload?.param?.uniqueCode,
      };
    }
    const { data: postData } = yield putInvoiceList({
      invoice_id: payload?.param?.idInvoice,
      body,
    });

    if (postData?.data?.length) {
      postData?.data?.forEach((e) => {
        const companyBarcode = e?.company_barcode || "";

        return toast.error(
          <MessageError
            msg={`goods dengan company barcode ${companyBarcode} sudah dibuatkan invoice`}
          />,
          {
            className: "toast-message-error",
            autoClose: 10000,
          }
        );
      });
    } else {
      toast.success(
        <MessageSuccess msg={"You have successfully update invoice list"} />,
        {
          className: "toast-message-success",
        }
      );
    }

    const { data } = yield getListInvoice(paramater);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.error(
      <MessageError msg={error?.response?.data?.message || error} />,
      {
        className: "toast-message-error",
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    payload?.param?.resetAll();
  }
}

export function* PRINT_INVOICE(payload) {
  yield put({ type: actions.SET_STATE, payload: { loadingInvoice: true } });

  const paramater = payload.param.params
    ? payload.param.params
    : payload.param.paramsList;

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: postData } = yield printInvoice({
      invoice_id: payload?.param?.id,
    });

    const { data } = yield getListInvoice(paramater);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
    toast.success(
      <MessageSuccess
        msg={"You have successfully update print status invoice"}
      />,
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
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    // payload.param.setParams({
    //   ...paramater,
    //   page: 1,
    // });
  }
}

export function* CHANGE_STATUS(payload) {
  console.log(payload);
  yield put({
    type: actions.SET_STATE,
    payload: { loadingInvoice: true, invoiceList: null },
  });
  try {
    const { data: postData } = yield changeInvoiceStatus(payload);
    const { data } = yield getListInvoice(payload.param.params);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
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
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    payload.param.setIsModalOpen(false);
  }
}

export function* MARK_PAID(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingInvoice: true, invoiceList: null },
  });
  try {
    const { data: postData } = yield MarkasPaid(payload.param.idInvoice);

    const { data } = yield getListInvoice(payload.param.params);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
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
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    payload.param.setCheckingInvoice(false);
  }
}

export function* MARK_PAID_COORDINATOR(payload) {
  console.log("payload", payload);
  yield put({
    type: actions.SET_STATE,
    payload: { loadingInvoice: true, invoiceList: null },
  });
  try {
    const { data: postData } = yield MarkasPaidCoordinator(
      payload.param.body.id
    );

    const { data } = yield getListInvoice(payload.param.paramsList);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
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
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    // payload.param.setIsModalOpen(false);
  }
}

export function* CREATE_INVOICE_DIFF(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingInvoice: true },
  });

  const params = {
    id: payload.param.id,
    body: {
      detail: payload.param.detail,
    },
  };

  try {
    // eslint-disable-next-line no-unused-vars
    const { data: _ } = yield createInvoiceDiff(params);

    toast.success(
      <MessageSuccess
        msg={"You have successfully create invoice difference"}
      />,
      { className: "toast-message-success" }
    );

    const paramater = payload.param.paramsList;

    const { data } = yield getListInvoice(paramater);
    yield put({ type: actions.SET_STATE, payload: { invoiceList: data } });
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.warn(
      <MessageSuccess msg={error?.response?.data?.message || error} />,
      {
        // className: 'toast-message-success'
      }
    );
  } finally {
    yield put({ type: actions.SET_STATE, payload: { loadingInvoice: false } });
    payload.param.resetAll();
  }
}

export function* GET_INVOICE_DIFF_DETAIL(payload) {
  yield put({
    type: actions.SET_STATE,
    payload: { loadingDetailInvoice: true },
  });

  const params = payload.param.id;

  try {
    const { data } = yield getInvoiceDiffDetail(params);
    yield put({
      type: actions.SET_STATE,
      payload: { detailInvoice: data },
    });

    toast.success(
      <MessageSuccess
        msg={"You have successfully get invoice difference detail"}
      />,
      { className: "toast-message-success" }
    );
  } catch ({ message: error }) {
    yield put({ type: actions.SET_STATE, payload: { error } });
    toast.warn(
      <MessageSuccess msg={error?.response?.data?.message || error} />,
      {
        // className: 'toast-message-success'
      }
    );
  } finally {
    yield put({
      type: actions.SET_STATE,
      payload: { loadingDetailInvoice: false },
    });
    // payload.param.resetAll();
  }
}

export default function* listInvoiceSagas() {
  yield all([
    takeEvery(actions.POST_DATA, POST_GROUPING),
    takeEvery(actions.POST_MARK_PAID, MARK_PAID),
    takeEvery(actions.POST_MARK_PAID_COORDINATOR, MARK_PAID_COORDINATOR),
    takeEvery(actions.PUT_STATUS, CHANGE_STATUS),
    takeEvery(actions.GET_LIST_INVOICE, GET_LIST_INVOICE),
    takeEvery(actions.GET_DETAIL_INVOICE, GET_DETAIL_INVOICE),

    takeEvery(actions.GET_FINAL_GOODS, GET_FINALS_GOODS),
    takeEvery(actions.GET_FINAL_GOODS_SALES, GET_FINALS_GOODS_SALES),

    takeEvery(actions.PUT_DATA, PUT_INVOICE_LIST),
    takeEvery(actions.PRINT_INVOICE, PRINT_INVOICE),

    takeEvery(actions.GET_DETAIL_REVISED_INVOICE, GET_DETAIL_REVISED_INVOICE),
    takeEvery(actions.CREATE_INVOICE_DIFF, CREATE_INVOICE_DIFF),
    takeEvery(actions.GET_INVOICE_DIFF_DETAIL, GET_INVOICE_DIFF_DETAIL),
  ]);
}
