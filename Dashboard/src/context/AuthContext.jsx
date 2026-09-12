import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  clearSession,
  getCurrentUser,
  getStoredUser,
  logout as logoutUser,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /*
   * Cached user is used only for faster UI rendering.
   *
   * Real authentication is always verified through
   * the backend HttpOnly cookie.
   */
  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  /*
   * =========================================================
   * CHECK AUTHENTICATION
   * =========================================================
   *
   * Do NOT depend on Dashboard localStorage token.
   *
   * Backend /auth/me checks the HttpOnly cookie.
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);

      const currentUser =
        await getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        clearSession();
      }
    } catch (error) {
      console.error(
        "Authentication check failed:",
        error
      );

      setUser(null);
      setIsAuthenticated(false);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * =========================================================
   * INITIAL AUTH CHECK
   * =========================================================
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /*
   * =========================================================
   * UNAUTHORIZED EVENT
   * =========================================================
   *
   * Axios interceptor can dispatch this when backend
   * returns 401.
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();

      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener(
      "apnaacademy:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "apnaacademy:unauthorized",
        handleUnauthorized
      );
    };
  }, []);

  /*
   * =========================================================
   * STORAGE CHANGE
   * =========================================================
   *
   * Kept for legacy token compatibility and cached user
   * synchronization.
   */
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key === "token" ||
        event.key === "user"
      ) {
        const storedUser = getStoredUser();

        setUser(storedUser);

        /*
         * If another tab removes the local session,
         * refresh authentication from backend.
         */
        if (!storedUser) {
          checkAuth();
        }
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [checkAuth]);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   *
   * 1. Backend clears HttpOnly cookie.
   * 2. Local legacy session is cleared.
   * 3. React auth state is cleared.
   */
 const logout = useCallback(async () => {
  try {
    await logoutUser();
  } finally {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();

    window.location.replace(
      "http://localhost:5174/"
    );
  }
}, []);

  /*
   * =========================================================
   * REFRESH USER
   * =========================================================
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser =
        await getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);

        return currentUser;
      }

      setUser(null);
      setIsAuthenticated(false);
      clearSession();

      return null;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      clearSession();

      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        logout,
        refreshUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * =========================================================
 * USE AUTH
 * =========================================================
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}