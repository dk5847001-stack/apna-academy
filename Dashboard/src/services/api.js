import axios from "axios";

import {
  API_BASE_URL,
  API_TIMEOUT,
  STORAGE_KEYS,
} from "../constants/config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  withCredentials: true,
});

/*
 * Attach authentication token to every API request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * Central API response handling.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      /*
       * Do not redirect from the interceptor.
       * Route/auth state will handle navigation.
       */
      window.dispatchEvent(
        new CustomEvent("apnaacademy:unauthorized")
      );
    }

    return Promise.reject(error);
  }
);

export default api;