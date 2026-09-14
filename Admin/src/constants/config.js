export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:5174";

export const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL || "http://localhost:5176";

export const APP_NAME = "ApnaAcademy Admin";

export const ROUTES = {
  HOME: "/",
  COURSES: "/courses",
};
