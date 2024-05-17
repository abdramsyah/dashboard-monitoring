import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListCoordinatorManagement = (params) =>
  httpClient.get(`${API_VERSION.V1}/coordinator`, {
    params,
  });

export const addNewCoordinator = (params) =>
  httpClient.post(`${API_VERSION.V1}/coordinator`, params);

export const deleteCoordinator = (params) =>
  httpClient.delete(`${API_VERSION.V1}/coordinator/${params}`);

export const updateCoordinator = (params) =>
  httpClient.put(`${API_VERSION.V1}/coordinator`, params);

export const getCoordinatorPerforma = (params) =>
  httpClient.get(`${API_VERSION.V1}/coordinator/performance`, {
    params,
  });
