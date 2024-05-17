import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getListClientManagement = (params) =>
  httpClient.get(`${API_VERSION.V1}/client-management`, {
    params,
  });

export const createClient = (params) =>
  httpClient.post(`${API_VERSION.V1}/client-management`, params);

export const editClientManagament = (params) =>
  httpClient.put(`${API_VERSION.V1}/client-management`, params);

export const deleteClientManagement = (params) =>
  httpClient.delete(`${API_VERSION.V1}/client-management/${params}`);

export const getSupplyPowerManagement = (params) =>
  httpClient.get(`${API_VERSION.V1}/supply-power-management`, {
    params,
  });

export const getRecapSupplyPowerManagement = (params) =>
  httpClient.get(`${API_VERSION.V1}/supply-power-management/recap`, {
    params,
  });
