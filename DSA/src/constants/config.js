export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  "https://apnaacademy.me";

export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ||
  "https://dashboard.apnaacademy.me";

export const COURSE_URL =
  import.meta.env.VITE_COURSE_URL ||
  "https://course.apnaacademy.me";

export const DSA_URL =
  import.meta.env.VITE_DSA_URL ||
  "https://dsa.apnaacademy.me";

export const EXTERNAL_ROUTES = {
  FRONTEND: FRONTEND_URL,
  DASHBOARD: DASHBOARD_URL,
  COURSE: COURSE_URL,
  DSA: DSA_URL,
};
