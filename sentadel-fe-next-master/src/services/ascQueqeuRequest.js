import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListAscQuequeRequest = (params) =>
  httpClient.get(`${API_VERSION.V1}/queue-request`, {
    params,
  });

export const postAscQuequeRequest = (params) =>
  httpClient.put(`${API_VERSION.V1}/queue-request/${params.id}`, {
    status: params.status,
    code: params.code,
    request_quantity: params.request_quantity,
    coordinator_id: params.coordinator_id,
  });
