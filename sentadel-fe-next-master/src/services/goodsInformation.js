import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListGoodsInformation = (params) =>
  httpClient.post(`${API_VERSION.V1}/purchase/get-list`, params);

export const getSingleGoodsInformation = (params) =>
  httpClient.post(`${API_VERSION.V1}/purchase/get-single`, params);

export const markGoodsAsApproved = (params) =>
  httpClient.put(`${API_VERSION.V1}/purchase/approve`, params);

export const reviseFinalGoods = (params) =>
  httpClient.put(`${API_VERSION.V1}/purchase/update-ase`, params);
