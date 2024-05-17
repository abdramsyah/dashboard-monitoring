import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListCoordiantorGroup = (params) =>
  httpClient.get(`${API_VERSION.V1}/coordinator/group`, {
    params,
  });

export const addUpdateCoordinatorGroup = (params) =>
  httpClient.put(`${API_VERSION.V1}/coordinator/group`, params, {});
