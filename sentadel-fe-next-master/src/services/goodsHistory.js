import { API_VERSION } from "@/api/queries/endpoint";
import { httpClient } from "../api/httpClient";

export const getGoodsHistory = (params) =>
  httpClient.get(`${API_VERSION.V1}/coordinator/goods-history`, {
    params,
  });
