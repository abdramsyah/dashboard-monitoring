import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListUniqueCodeGenerator = (params) =>
  httpClient.get(`${API_VERSION.V1}/unique-code/history`, {
    params,
  });

export const postUniqueCodeGenerator = () =>
  httpClient.post(`${API_VERSION.V1}/unique-code/generate`);

export const validateUniqueCode = (params) =>
  httpClient.post(`${API_VERSION.V1}/unique-code/validate`, params);

export const validateAndBurn = (params) =>
  httpClient.post(`${API_VERSION.V1}/unique-code/validate-and-burn`, params);
