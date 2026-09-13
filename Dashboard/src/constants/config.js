export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  "http://localhost:5174";

export const COURSE_URL =
  import.meta.env.VITE_COURSE_URL ||
  "http://localhost:5173";

export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ||
  "http://localhost:5175";

export const APP_NAME = "ApnaAcademy";

export const APP_ENV =
  import.meta.env.MODE || "development";

export const IS_PRODUCTION =
  APP_ENV === "production";

export const API_TIMEOUT = 15000;

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "apnaacademy-theme",
};

export const ROUTES = {
  HOME: "/dashboard",
  COURSES: "/dashboard/courses",
  MY_COURSES: "/dashboard/my-courses",
  PURCHASES: "/dashboard/purchases",
  PROGRESS: "/dashboard/progress",
  CERTIFICATES: "/dashboard/certificates",
  NOTIFICATIONS: "/dashboard/notifications",
  PROFILE: "/dashboard/profile",
  SUPPORT: "/dashboard/support",
};

export const COURSE_ROUTES = {
  DETAILS: (slug) =>
    `${COURSE_URL}/courses/${encodeURIComponent(slug)}`,

  LEARN: (slug) =>
    `${COURSE_URL}/courses/${encodeURIComponent(slug)}/learn`,

  VIDEO: (slug, videoId) =>
    `${COURSE_URL}/courses/${encodeURIComponent(slug)}/learn/${encodeURIComponent(videoId)}`,

  CERTIFICATE: (slug) =>
    `${COURSE_URL}/courses/${encodeURIComponent(slug)}/certificate`,
};

export const EXTERNAL_ROUTES = {
  FRONTEND: FRONTEND_URL,
  COURSE: COURSE_URL,
};
