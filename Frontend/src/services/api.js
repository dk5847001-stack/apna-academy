import axios from "axios";

import { API_BASE_URL } from "../constants/config";

/* =========================================================
   AXIOS API CLIENT
========================================================= */

const api = axios.create({
  baseURL: API_BASE_URL,

  timeout: 15000,

  /*
   * Required for the shared HttpOnly authentication
   * cookie used by Frontend, Dashboard and Course apps.
   */
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    /*
     * Keep Bearer-token support for backward compatibility.
     *
     * The primary authentication mechanism is now the
     * HttpOnly cookie created by the backend.
     */
    const token = localStorage.getItem("token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error?.response?.status;

    /*
     * If JWT authentication is invalid/expired,
     * remove the legacy local session.
     *
     * The HttpOnly cookie itself cannot be removed
     * from JavaScript. Backend logout will handle
     * clearing that cookie when logout is implemented.
     */
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      /*
       * Notify same-app components about
       * authentication state changes.
       */
      window.dispatchEvent(
        new Event(
          "apnaacademy-auth-change"
        )
      );
    }

    return Promise.reject(error);
  }
);

export default api;