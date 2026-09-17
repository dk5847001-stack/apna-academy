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

const sleep = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

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

    if (status === 401) {
      window.dispatchEvent(
        new Event("apnaacademy-auth-change")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
