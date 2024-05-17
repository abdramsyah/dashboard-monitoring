import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const postWeightInformationEntry = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/create-new-weights`, params);

export const putWeightInformationEntry = (params) =>
  httpClient.put(`${API_VERSION.V1}/entry/update-new-weights`, params);

export const getListWeightInformationEntry = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/table-weights`, params);

export const getNetWeight = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/get-net-weight`, params);

export const getWeightCoordinator = (params) =>
  httpClient.get(`${API_VERSION.V1}/entry/weights-coordinator-dropdown`, {
    params,
  });

export const insertClientBarcode = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/insert-client-barcode`, params);

export const getASEByCompanyBarcode = (params) =>
  httpClient.post(`${API_VERSION.V1}/entry/get-ase-by-company-barcode`, params);
