import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getDataLake = (params) =>
  httpClient.get(`${API_VERSION.V1}/data-lake/get-list`, {
    params,
  });
