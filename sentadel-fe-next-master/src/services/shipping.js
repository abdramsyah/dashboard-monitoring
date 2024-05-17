import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postShipping = (params) =>
  httpClient.post(`${API_VERSION.V1}/bucket-shipping/${params.idClient}`, {
    client_group_id: params.goods_information_id,
    address_id: params.address_id,
    client_code: params.client_code,
  });

export const markAsShip = (params) =>
  httpClient.put(`${API_VERSION.V1}/bucket-shipping/mark-as-ship/${params}`);

export const getListShipping = (params) =>
  httpClient.get(`${API_VERSION.V1}/bucket-shipping`, {
    params,
  });

export const getDetailShipping = (params) =>
  httpClient.get(`${API_VERSION.V1}/bucket-shipping/${params}`);

export const getListAddress = (params) =>
  httpClient.get(`${API_VERSION.V1}/bucket-shipping/address/${params}`);

export const getGroupingList = (params) =>
  httpClient.get(`${API_VERSION.V1}/bucket-shipping/grouping?`, {
    params,
  });

export const getClientDropdown = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/client-dropdown`, {
    params,
  });

export const editGoodsInformationEntry = (params) =>
  httpClient.put(`${API_VERSION.V1}/entry/goods`, params);
