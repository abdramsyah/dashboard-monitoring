import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postGoodsInformationEntry = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/create-new-goods`, params);

export const getListGoodsInformationEntry = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/table-goods`, params);

export const getListBucket = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/goods-bucket-list`, {
    params,
  });

export const getGradePrice = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/get-grade-price`, params);

export const getCoordinatorDropdown = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/goods-coordinator-dropdown`, {
    params,
  });

export const getClientDropdown = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/client-dropdown`, {
    params,
  });

export const getProfitDropdown = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/profit-taking-dropdown`, {
    params,
  });

export const updateGoodsInformationEntry = (params) =>
  httpClient.put(`${API_VERSION.V1}/entry/update-goods`, params);

export const rejectGoodsInformationEntry = (params) =>
  httpClient.delete(`${API_VERSION.V1}/entry/reject-goods/${params}`);

export const rejectBuckets = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/reject-buckets`, params);
