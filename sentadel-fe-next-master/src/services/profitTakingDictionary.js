import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postProfitTakingDictionary = (params) =>
  httpClient.post(`${API_VERSION.V1}/profit-taking-dictionary`, params);

export const getListProfitTakingDictionary = (params) =>
  httpClient.get(`${API_VERSION.V1}/profit-taking-dictionary`, {
    params,
  });

export const editProfitTakingDictionary = (params) =>
  httpClient.put(`${API_VERSION.V1}/profit-taking-dictionary`, params);

export const deleteProfitTakingDictionary = (params) =>
  httpClient.delete(`${API_VERSION.V1}/profit-taking-dictionary/${params}`);
