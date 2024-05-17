import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postQueueRequest = (params) =>
  httpClient.post(`${API_VERSION.V1}/queue-request`, params);

export const getQueueList = (params) =>
  httpClient.get(`${API_VERSION.V1}/queue-request`, {
    params,
  });

export const getQueueGroup = (params) =>
  httpClient.get(`${API_VERSION.V1}/queue-request/group`, {
    params,
  });

export const approveQueue = (params) =>
  httpClient.put(`${API_VERSION.V1}/queue-request/approve`, params);

export const rejectQueue = (params) =>
  httpClient.put(`${API_VERSION.V1}/queue-request/reject`, params);

export const pourOutBucket = (params) =>
  httpClient.post(`${API_VERSION.V1}/queue-request/pour-out`, params);
