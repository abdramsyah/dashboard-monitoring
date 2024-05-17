import axios from "axios";
import { store } from "@/store/store";
import { STORAGE_KEY } from "@/constants/localStorageKey";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const interceptors = {
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  responseType: "json",
};

export const httpClient = axios.create({
  ...interceptors,
  baseURL,
});

httpClient.interceptors.request.use((request) => {
  const token = localStorage.getItem(STORAGE_KEY.TOKEN);
  if (
    (request.headers["Authorization"] === `Bearer ${null}` ||
      !request.headers["Authorization"]) &&
    token
  ) {
    request.headers["Authorization"] = "Bearer " + token;
  }

  return request;
});

httpClient.interceptors.response.use(
  async (response) => {
    return Promise.resolve(response);
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        store.dispatch({ type: "auth/LOGOUT" });
        localStorage.clear();
        window.location = "/login";
      } catch (errorResponse) {
        return Promise.reject(errorResponse);
      }
    }
    return Promise.reject(error);
  }
);
