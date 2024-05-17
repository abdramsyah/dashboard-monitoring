import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postLogin = (payload) => {
  return httpClient.post(`${API_VERSION.V1}/auth/login`, payload);
};
