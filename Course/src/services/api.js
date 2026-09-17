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
    Accept: "application/json",
  },
});

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 350;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/* =========================================================
   TRANSIENT GET RECOVERY
========================================================= */

api.interceptors.response.use(
  (response) => response,
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

    const authStatus = error?.response?.status;

    if (authStatus === 401) {
      console.warn("Authentication required or session expired.");
    }

    if (authStatus === 403) {
      console.warn("You are not authorized to access this resource.");
    }

    if (authStatus === 404) {
      console.warn("Requested resource was not found.");
    }

    if (authStatus >= 500) {
      console.error("ApnaAcademy server error.");
    }

    return Promise.reject(error);
  }
);

export default api;
