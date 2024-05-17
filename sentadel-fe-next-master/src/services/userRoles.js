import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListRoles = (params) =>
  httpClient.get(`${API_VERSION.V1}/auth/roles`, {
    params,
  });
