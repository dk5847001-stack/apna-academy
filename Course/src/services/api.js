import axios from "axios";

import {
  API_BASE_URL,
  API_TIMEOUT,
} from "../constants/config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   AUTHENTICATION
   HttpOnly cookie is the sole authentication source.
========================================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("Authentication required or session expired.");
    }

    if (status === 403) {
      console.warn("You are not authorized to access this resource.");
    }

    if (status === 404) {
      console.warn("Requested resource was not found.");
    }

    if (status >= 500) {
      console.error("ApnaAcademy server error.");
    }

    return Promise.reject(error);
  }
);

export default api;
