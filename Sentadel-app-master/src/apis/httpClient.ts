import { storage, STORAGE_KEYS } from '@sentadell-src/database/mmkv';
import { UsersDataType } from '@sentadell-src/types/auth';
import { LOG } from '@sentadell-src/utils/commons';
import axios, { AxiosRequestConfig } from 'axios';
import Config from 'react-native-config';

const interceptors: AxiosRequestConfig = {
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  responseType: 'json'
};

export const httpClient = axios.create({
  ...interceptors,
  baseURL: Config.BASE_URL
});

httpClient.interceptors.request.use(request => {
  const userDataStorage = storage.getString(STORAGE_KEYS.USER);

  const userDataParse: UsersDataType | null = JSON.parse(
    userDataStorage || 'null'
  );

  // LOG.info('interceptors - userDataParse', userDataParse);
  // LOG.info('interceptors - userDataStorage', userDataStorage);

  const token = userDataParse?.token;

  if (__DEV__) {
    LOG.warn(request);
  }
  request.headers['Authorization'] = 'Bearer ' + token;

  return request;
});

httpClient.interceptors.response.use(
  async response => {
    return Promise.resolve(response);
  },
  async error => {
    if (error.response?.status === 401) {
      try {
        // store.dispatch({ type: "auth/LOGOUT" });
        storage.delete(STORAGE_KEYS.USER);
      } catch (errorResponse) {
        return Promise.reject(errorResponse);
      }
    }
    return Promise.reject(error);
  }
);
