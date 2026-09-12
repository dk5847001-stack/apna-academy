import api from "./api";

import {
  STORAGE_KEYS,
} from "../constants/config";

/**
 * Store authenticated user session.
 */
const saveSession = (data) => {
  if (data?.token) {
    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      data.token
    );
  }

  if (data?.user) {
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(data.user)
    );
  }
};

/**
 * Clear authenticated user session.
 */
export const clearSession = () => {
  localStorage.removeItem(
    STORAGE_KEYS.TOKEN
  );

  localStorage.removeItem(
    STORAGE_KEYS.USER
  );
};

/**
 * Register a new user.
 */
export const register = async ({
  name,
  email,
  password,
}) => {
  const response = await api.post(
    "/auth/register",
    {
      name,
      email,
      password,
    }
  );

  const data = response?.data?.data;

  if (data?.token && data?.user) {
    saveSession(data);
  }

  return response.data;
};

/**
 * Login existing user.
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

  const data = response?.data?.data;

  if (data?.token && data?.user) {
    saveSession(data);
  }

  return response.data;
};

/**
 * Get currently authenticated user.
 */
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  const user = response?.data?.data;

  if (user) {
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user)
    );
  }

  return user;
};

/**
 * Check whether a token exists locally.
 */
export const hasToken = () => {
  return Boolean(
    localStorage.getItem(
      STORAGE_KEYS.TOKEN
    )
  );
};

/**
 * Get cached user.
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(
      STORAGE_KEYS.USER
    );

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Logout current user.
 */
export const logout = () => {
  clearSession();
};

const authService = {
  register,
  login,
  getCurrentUser,
  hasToken,
  getStoredUser,
  clearSession,
  logout,
};

export default authService;