import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const setNewTax = (params) =>
  httpClient.post(`${API_VERSION.V1}/tax`, params);

export const setNewFee = (params) =>
  httpClient.post(`${API_VERSION.V1}/fee`, params);

export const getTaxData = (params) =>
  httpClient.get(`${API_VERSION.V1}/tax`, {
    params,
  });

export const getFeeData = (params) =>
  httpClient.get(`${API_VERSION.V1}/fee`, {
    params,
  });
