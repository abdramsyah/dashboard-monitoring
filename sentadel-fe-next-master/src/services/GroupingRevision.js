import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postGroupingRepision = (params) =>
  httpClient.post(`${API_VERSION.V1}/sales/grouping/${params.idClient}`, {
    goods_information_id: params.goods_information_id,
    client_code: params.client_code,
  });

export const putGroupingRepision = (params) =>
  httpClient.put(`${API_VERSION.V1}/sales/grouping/${params.idClient}`, {
    goods_information_id: params.goods_information_id,
    unique_code: params.unique_code,
  });

export const getListGrouping = (params) =>
  httpClient.get(`${API_VERSION.V1}/sales/grouping`, {
    params,
  });

export const getDetailGrouping = (params) =>
  httpClient.get(`${API_VERSION.V1}/sales/grouping/${params}`);

export const getFinalGoods = (params) =>
  httpClient.get(`${API_VERSION.V1}/sales/final-goods/get-list`, {
    params,
  });

export const getClientDropdown = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/client-dropdown`, {
    params,
  });

export const rejectAndChangeGrade = (params) =>
  httpClient.put(
    `${API_VERSION.V1}/sales/grouping/reject-and-change-grade`,
    params
  );
