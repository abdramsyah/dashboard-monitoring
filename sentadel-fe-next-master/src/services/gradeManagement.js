import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListGradeDictionary = (params) =>
  httpClient.get(`${API_VERSION.V1}/grade-management`, {
    params,
  });

export const postGradeDictionary = (params) =>
  httpClient.post(`${API_VERSION.V1}/grade-management`, params);

export const editGradeDictionary = (params) =>
  httpClient.put(`${API_VERSION.V1}/grade-management`, params);

export const deleteGradeDictionary = (params) =>
  httpClient.delete(`${API_VERSION.V1}/grade-management/${params}`);
