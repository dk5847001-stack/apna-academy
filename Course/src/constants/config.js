export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  "http://localhost:5174";

export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ||
  "http://localhost:5175";

export const COURSE_URL =
  import.meta.env.VITE_COURSE_URL ||
  "http://localhost:5173";

export const APP_NAME = "ApnaAcademy";

export const APP_ENV =
  import.meta.env.MODE || "development";

export const IS_PRODUCTION =
  APP_ENV === "production";

export const API_TIMEOUT = 15000;

export const STORAGE_KEYS = {
  USER: "user",
  THEME: "apnaacademy-theme",
};

export const COURSE_ROUTES = {
  HOME: "/",

  DETAILS: (slug) =>
    `/courses/${slug}`,

  LEARN: (slug) =>
    `/courses/${slug}/learn`,

  VIDEO: (slug, videoId) =>
    `/courses/${slug}/learn/${videoId}`,

  CERTIFICATE: (slug) =>
    `/courses/${slug}/certificate`,
};

export const EXTERNAL_ROUTES = {
  FRONTEND: FRONTEND_URL,
  DASHBOARD: DASHBOARD_URL,
};

export const LEARNING_RULES = {
  VIDEO_COMPLETION_PERCENTAGE: 80,

  CERTIFICATE_PROGRESS_PERCENTAGE: 100,

  ALL_ACCESS_PRICE: 99,
};
