// ============================================================
// ApnaAcademy - Frontend Application Configuration
// ============================================================

// Backend API
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// Separate Student Dashboard React App
export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ||
  "http://localhost:5175";

// Separate Course/Learning React App
export const COURSE_URL =
  import.meta.env.VITE_COURSE_URL ||
  "http://localhost:5174";

// Separate Admin React App
export const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL ||
  "http://localhost:5176";

// Separate DSA Practice React App
export const DSA_URL =
  import.meta.env.VITE_DSA_URL ||
  "https://dsa.apnaacademy.me";
