import axios from "axios";

import { API_BASE_URL } from "../constants/config";

/* =========================================================
   AXIOS API CLIENT
========================================================= */

const api = axios.create({
  baseURL: API_BASE_URL,

  timeout: 15000,

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
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    /*
      If JWT is expired/invalid, remove local
      authentication data.

      We intentionally do not redirect here because
      different React apps have different login URLs.
    */

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      /*
        Notify same-app components such as Navbar
        about authentication state changes.
      */

      window.dispatchEvent(
        new Event("apnaacademy-auth-change")
      );
    }

    return Promise.reject(error);
  }
);

export default api;