const trimTrailingSlashes = (value) => {
  if (!value) return "";
  return value.replace(/\/+$/, "");
};

export const API_BASE_URL = trimTrailingSlashes(
  import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1"
);

export const DASHBOARD_URL = trimTrailingSlashes(
  import.meta.env.VITE_DASHBOARD_URL ||
    "http://localhost:5175"
);

export const COURSE_URL = trimTrailingSlashes(
  import.meta.env.VITE_COURSE_URL ||
    "http://localhost:5174"
);

export const ADMIN_URL = trimTrailingSlashes(
  import.meta.env.VITE_ADMIN_URL ||
    "http://localhost:5176"
);

export const APP_CONFIG = {
  name: "ApnaAcademy",
  apiBaseUrl: API_BASE_URL,
  dashboardUrl: DASHBOARD_URL,
  courseUrl: COURSE_URL,
  adminUrl: ADMIN_URL,
};