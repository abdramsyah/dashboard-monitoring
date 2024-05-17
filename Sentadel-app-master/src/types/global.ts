/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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

type ErrorDataType = {
  data: unknown;
  message?: string;
  status: number;
};

export interface ErrorResponseType<D = any, T = ErrorDataType>
  extends AxiosError {
  config?: InternalAxiosRequestConfig<D>;
  response?: AxiosResponse<T, D>;
}

export type GetRealmBaseProps = {
  from?: number;
  limit?: number;
};

type filterType = {
  filter: string;
};

export type FilterParamsType = {
  [K in keyof filterType as `${K}[${number}]`]?: string;
};

type FilterSortType = {
  filter: string;
  sortby: string;
};

export type FilterSortParamsType = {
  [K in keyof FilterSortType as `${K}[${number}]`]?: string;
};

export interface SearchFilterSortParams extends FilterSortParamsType {
  limit: number;
  page: number;
  keyword?: string;
}

export interface SearchFilterSortParamsOpt extends FilterSortParamsType {
  limit?: number;
  page?: number;
  keyword?: string;
}
