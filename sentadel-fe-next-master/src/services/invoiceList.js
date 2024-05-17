import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postInvoiceList = (params) =>
  httpClient.post(`${API_VERSION.V1}/payment/invoice/${params.idClient}`, {
    goods_information_id: params.goods_information_id,
  });

export const putInvoiceList = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice/${params.invoice_id}`,
    params.body
  );

export const printInvoice = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice/print/${params.invoice_id}`
  );

export const MarkasPaid = (params) =>
  httpClient.put(`${API_VERSION.V1}/payment/invoice/mark-as-paid/${params}`);

export const MarkasPaidCoordinator = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice/mark-as-paid-coordinator/${params}`
  );

export const getListInvoice = (params) =>
  httpClient.get(`${API_VERSION.V1}/payment/invoice`, {
    params,
  });

export const getFinalGoods = (params) =>
  httpClient.get(`${API_VERSION.V1}/payment/final-goods/get-list`, {
    params,
  });

export const getFinalGoodsSales = (params) =>
  httpClient.get(`${API_VERSION.V1}/sales/final-goods/get-list`, {
    params,
  });

export const getDetailInvoice = (params) =>
  httpClient.get(`${API_VERSION.V1}/payment/invoice/${params}`);

export const getDetailRevisedInvoice = (params) =>
  httpClient.get(`${API_VERSION.V1}/payment/invoice/revised/${params}`);

export const createInvoiceDiff = (params) =>
  httpClient.post(`${API_VERSION.V1}/payment/invoice-diff/${params.id}`, {
    ...params.body,
  });

export const updateInvoiceDiff = (params) =>
  httpClient.put(`${API_VERSION.V1}/payment/invoice-diff/${params.id}`, {
    ...params.body,
  });

export const getInvoiceDiffDetail = (params) =>
  httpClient.get(`${API_VERSION.V1}/payment/invoice-diff/${params}`);

export const changeInvoiceStatus = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice/change-status/${params.id}`,
    {
      status: params.status,
    }
  );

export const changeInvoiceDiffStatus = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice-diff/change-status/${params.id}`,
    {
      status: params.status,
    }
  );

export const markInvoiceDiffAsPaidAdmin = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice-diff/mark-as-paid-admin/${params}`
  );

export const markInvoiceDiffAsPaidCoordinator = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice-diff/mark-as-paid-coordinator/${params}`
  );

export const printInvoiceDiff = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/payment/invoice-diff/print/${params.invoice_diff_id}`
  );
