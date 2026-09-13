import axios from "axios";

import {
  API_BASE_URL,
  API_TIMEOUT,
} from "../constants/config";

/* =========================================================
   AXIOS API CLIENT
========================================================= */

/*
 * Authentication is handled exclusively by the Backend
 * HttpOnly cookie.
 *
 * The browser automatically sends the cookie because
 * withCredentials is enabled.
 *
 * We intentionally DO NOT read or attach JWT tokens
 * from localStorage.
 */

const api = axios.create({
  baseURL: API_BASE_URL,

  timeout: API_TIMEOUT,

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
     * No Authorization: Bearer token.
     *
     * Authentication is handled by the HttpOnly cookie.
     */

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

    /*
     * Backend says that the current session is not
     * authenticated.
     *
     * We cannot clear the HttpOnly cookie from JavaScript.
     *
     * The backend /auth/logout endpoint is responsible
     * for clearing the authentication cookie.
     */

    if (status === 401) {
      window.dispatchEvent(
        new Event("apnaacademy-auth-change")
      );
    }

    return Promise.reject(error);
  }
);
export default api;