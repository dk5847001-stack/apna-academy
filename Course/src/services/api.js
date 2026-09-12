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
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
   Attach authentication token when available
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      STORAGE_KEYS.TOKEN
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn(
        "Authentication required or session expired."
      );
    }

    if (status === 403) {
      console.warn(
        "You are not authorized to access this resource."
      );
    }

    if (status === 404) {
      console.warn(
        "Requested resource was not found."
      );
    }

    if (status >= 500) {
      console.error(
        "ApnaAcademy server error."
      );
    }

    return Promise.reject(error);
  }
);

export default api;