import api from "./api";

/**
 * Register a new user.
 *
 * Authentication is handled by the backend
 * using an HttpOnly cookie.
 *
 * IMPORTANT:
 * Never store the JWT/token in localStorage.
 */
export const register = async ({
  name,
  email,
  password,
  referralCode,
}) => {
  const response = await api.post(
    "/auth/register",
    {
      name,
      email,
      password,
      ...(referralCode ? { referralCode } : {}),
    }
  );

  return response.data;
};

/**
 * Login existing user.
 *
 * Backend sets the HttpOnly authentication cookie.
 * The browser stores and sends it automatically.
 */
export const login = async ({
  email,
  password,
}) => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};

/*
 * Share an in-flight /auth/me request. React StrictMode and multiple
 * dashboard consumers can otherwise hit the same endpoint at the same time,
 * needlessly consuming MongoDB pool capacity.
 */
let currentUserRequest = null;

/**
 * Get currently authenticated user.
 *
 * The HttpOnly authentication cookie is sent
 * automatically because api.js uses withCredentials.
 */
export const getCurrentUser = async () => {
  if (!currentUserRequest) {
    currentUserRequest = api
      .get("/auth/me")
      .then((response) => response?.data?.data || null)
      .finally(() => {
        currentUserRequest = null;
      });
  }

  return currentUserRequest;
};

/**
 * Get cached user information.
 *
 * IMPORTANT:
 * This is ONLY for UI hydration.
 *
 * It is NOT an authentication mechanism.
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(
      "user"
    );

    return user
      ? JSON.parse(user)
      : null;
  } catch {
    return null;
  }
};

/**
 * Save user information for UI hydration only.
 *
 * IMPORTANT:
 * Authentication token is NEVER stored here.
 */
export const saveStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem("user");
    return;
  }

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
};

/**
 * Clear UI-only cached user information.
 *
 * The real authentication cookie is cleared
 * by the backend /auth/logout endpoint.
 */
export const clearSession = () => {
  localStorage.removeItem("user");
};

/**
 * Logout current user.
 *
 * Backend is responsible for clearing the
 * HttpOnly authentication cookie.
 */
export const logout = async () => {
  try {
    await api.post(
      "/auth/logout"
    );
  } finally {
    clearSession();
  }
};

const authService = {
  register,
  login,
  getCurrentUser,
  getStoredUser,
  saveStoredUser,
  clearSession,
  logout,
};

export default authService;
