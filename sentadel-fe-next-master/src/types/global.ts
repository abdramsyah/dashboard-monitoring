import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export interface SuccessResponseType<T, D = any> extends AxiosResponse {
  data: {
    data: T;
    message?: string;
    status: number;
    meta?: MetaType;
  };
  config: InternalAxiosRequestConfig<D>;
}

export type MetaType = {
  page: number;
  pages: number;
  limit: number;
};

export interface ErrorResponseType<T = any, D = any> extends AxiosError {
  config?: InternalAxiosRequestConfig<D>;
  response?: AxiosResponse<T, D>;
}

type FilterType = {
  filter: string;
};

export type FilterParamsType = {
  [K in keyof FilterType as `${K}[${number}]`]?: string;
};

type FilterSortType = {
  filter: string;
  sortby: string;
};

export type FilterSortParamsType = {
  [K in keyof FilterSortType as `${K}[${number | string}]`]?: string;
};

export type BaseSearchParams = {
  limit: number;
  page: number;
  keyword: string;
  sortby: string;
};

export type NormalParams = {
  limit?: number;
  page?: number;
  keyword?: string;
};

export interface SearchFilterSortParams
  extends FilterSortParamsType,
    NormalParams {}
