import axios from "axios";

import { API_BASE_URL } from "../constants/config";

/* =========================================================
   AXIOS API CLIENT
========================================================= */

/*
 * Authentication is handled exclusively by the Backend
 * HttpOnly cookie.
 *
 * IMPORTANT:
 * Do NOT manually attach JWT tokens from localStorage.
 *
 * The browser automatically sends the HttpOnly cookie
 * because withCredentials is enabled.
 */

const api = axios.create({
  baseURL: API_BASE_URL,

  timeout: 60000,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 350;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
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

  async (error) => {
    const request = error?.config;
    const method = String(request?.method || "get").toUpperCase();
    const status = error?.response?.status;

    const retryableNetworkFailure =
      !error?.response &&
      error?.code !== "ECONNABORTED" &&
      error?.code !== "ETIMEDOUT";

    if (
      request &&
      method === "GET" &&
      !request.__apnaAcademyRetried &&
      (RETRYABLE_STATUS_CODES.has(status) || retryableNetworkFailure)
    ) {
      request.__apnaAcademyRetried = true;
      await sleep(RETRY_DELAY_MS);
      return api.request(request);
    }

    if (status === 401) {
      window.dispatchEvent(
        new Event("apnaacademy-auth-change")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
