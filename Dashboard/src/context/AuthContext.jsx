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
  saveStoredUser,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /*
   * Cached user is used only for faster initial UI rendering.
   *
   * IMPORTANT:
   * This is NOT authentication.
   *
   * Real authentication is always verified by:
   * GET /auth/me
   *
   * The backend HttpOnly cookie is the real
   * authentication source.
   */
  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [sessionSecurityNotice, setSessionSecurityNotice] =
    useState(null);

  /*
   * =========================================================
   * CHECK AUTHENTICATION
   * =========================================================
   *
   * Authentication is checked from the backend.
   *
   * No JWT/token is read from localStorage.
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);

      const currentUser =
        await getCurrentUser();

      if (!currentUser) {
        setUser(null);
        setIsAuthenticated(false);
        clearSession();

        return null;
      }

      /*
       * Backend successfully validated
       * the HttpOnly authentication cookie.
       */
      setUser(currentUser);
      setIsAuthenticated(true);

      /*
       * Cache user ONLY for UI hydration.
       * This does not authenticate the user.
       */
      saveStoredUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error(
        "Authentication check failed:",
        error
      );

      setUser(null);
      setIsAuthenticated(false);
      clearSession();

      return null;
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
   * Phase 4: actively monitor the server-side session.
   *
   * A replaced session cannot push a browser event by itself. Polling the
   * authenticated /auth/me endpoint gives the old browser a bounded detection
   * window while keeping the server as the source of truth.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      getCurrentUser().catch(() => {
        // The API interceptor handles 401/session-replacement events.
      });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

  /*
   * =========================================================
   * AUTH CHANGE / UNAUTHORIZED EVENT
   * =========================================================
   *
   * Dashboard API interceptor dispatches:
   *
   * apnaacademy-auth-change
   *
   * when backend returns HTTP 401.
   *
   * This immediately clears the React auth state.
   */
  useEffect(() => {
    const handleAuthChange = (event) => {
      const detail = event?.detail || {};

      if (detail.code === "SESSION_REPLACED" || detail.code === "ACCOUNT_SECURITY_FROZEN") {
        const notice = {
          title:
            detail.code === "ACCOUNT_SECURITY_FROZEN"
              ? "Account security freeze activated"
              : "Security alert: your session was ended",
          message:
            detail.message ||
            (detail.code === "ACCOUNT_SECURITY_FROZEN"
              ? "Your account was automatically frozen after reaching the concurrent login security limit."
              : "This account was signed in from another session, so this session was securely signed out."),
          detectionCount: detail.security?.detectionCount || 0,
          detectionLimit: detail.security?.detectionLimit || 5,
          remainingDetections:
            detail.security?.remainingDetections ?? null,
        };

        setSessionSecurityNotice(notice);

        try {
          window.sessionStorage.setItem(
            "apnaacademy-session-security-notice",
            JSON.stringify(notice)
          );
        } catch {
          // Session storage can be unavailable in privacy-restricted browsers.
        }
      }

      setUser(null);
      setIsAuthenticated(false);
      clearSession();
    };

    window.addEventListener(
      "apnaacademy-auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "apnaacademy-auth-change",
        handleAuthChange
      );
    };
  }, []);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   *
   * IMPORTANT:
   *
   * 1. Frontend calls POST /auth/logout.
   * 2. Backend executes res.clearCookie().
   * 3. HttpOnly authentication cookie is removed.
   * 4. React state is cleared.
   * 5. User is redirected to Frontend login.
   *
   * No JWT/token is stored or removed from localStorage.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearSession();

      window.location.replace(
        "http://localhost:5173/login"
      );
    }
  }, []);

  /*
   * =========================================================
   * REFRESH USER
   * =========================================================
   *
   * Re-validates the HttpOnly cookie with backend.
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser =
        await getCurrentUser();

      if (!currentUser) {
        setUser(null);
        setIsAuthenticated(false);
        clearSession();

        return null;
      }

      setUser(currentUser);
      setIsAuthenticated(true);

      /*
       * UI-only cache.
       */
      saveStoredUser(currentUser);

      return currentUser;
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
        sessionSecurityNotice,
        clearSessionSecurityNotice: () => setSessionSecurityNotice(null),
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