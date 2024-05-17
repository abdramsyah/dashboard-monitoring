import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListBarcodeSystems = (params) =>
  httpClient.get(`${API_VERSION.V1}/barcode-system`, {
    params,
  });

export const postBulkBarcodesSystem = (params) =>
  httpClient.post(`${API_VERSION.V1}/barcode-system`, params);

export const bulkScanInBarcode = (params) =>
  httpClient.put(`${API_VERSION.V1}/barcode-system`, params);

export const bulkScanOutBarcode = (params) =>
  httpClient.put(`${API_VERSION.V1}/barcode-system/out`, params);

export const createBarcodeSales = (params) =>
  httpClient.post(`${API_VERSION.V1}/barcode-system`, params);

export const getAdminList = () =>
  httpClient.get(`${API_VERSION.V1}/barcode-system/admin-list`);

export const getBarcodeSales = () =>
  httpClient.get(`${API_VERSION.V1}/barcode-system`);
