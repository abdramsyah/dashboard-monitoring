import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getUserList = (params) =>
  httpClient.get(`${API_VERSION.V1}/user-management`, {
    params,
  });

export const createUser = (params) =>
  httpClient.post(`${API_VERSION.V1}/user-management`, params);

export const editUserManagement = (params) =>
  httpClient.put(`${API_VERSION.V1}/user-management`, params);

export const deleteUserManagement = (params) =>
  httpClient.delete(`${API_VERSION.V1}/user-management/${params}`);
