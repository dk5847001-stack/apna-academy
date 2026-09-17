import axios from "axios";
import { API_BASE_URL } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000,
  withCredentials: true,
});

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 350;

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

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

    const retryableServerFailure = RETRYABLE_STATUS_CODES.has(status);

    if (
      request &&
      method === "GET" &&
      !request.__apnaAcademyRetried &&
      (retryableServerFailure || retryableNetworkFailure)
    ) {
      request.__apnaAcademyRetried = true;
      await sleep(RETRY_DELAY_MS);
      return api.request(request);
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};

export default api;
