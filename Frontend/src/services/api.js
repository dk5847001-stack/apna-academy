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

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

/*
 * No Authorization: Bearer token here.
 *
 * Authentication source of truth:
 *
 * Frontend
 *    ↓
 * HttpOnly Cookie
 *    ↓
 * Backend /auth/me
 *
 * HttpOnly cookies cannot be read by JavaScript,
 * which is intentional for security.
 */

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

  (error) => {
    const status = error?.response?.status;

    /*
     * A 401 means the backend does not consider the
     * current browser session authenticated.
     *
     * We do NOT try to remove the HttpOnly cookie here
     * because JavaScript cannot access it.
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
