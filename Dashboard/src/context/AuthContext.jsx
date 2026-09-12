import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearSession,
  getCurrentUser,
  getStoredUser,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /*
   * Cached user is only used to make the UI feel faster.
   *
   * Real authentication is always verified by the backend
   * through /auth/me using the HttpOnly authentication cookie.
   */
  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  /*
   * IMPORTANT:
   *
   * Do NOT use hasToken() here.
   *
   * Dashboard is a separate React application running on
   * another origin, so it cannot read Frontend's localStorage.
   *
   * The HttpOnly cookie is automatically sent to the backend.
   */
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  /*
   |--------------------------------------------------------------------------
   | Validate Current Session
   |--------------------------------------------------------------------------
   */

  const checkAuth = useCallback(async () => {
    setLoading(true);

    try {
      /*
       * The backend determines whether the session is valid.
       *
       * Axios uses withCredentials: true, so the browser
       * automatically sends the HttpOnly authentication cookie.
       */
      const currentUser =
        await getCurrentUser();

      if (!currentUser) {
        clearSession();

        setUser(null);
        setIsAuthenticated(false);

        return;
      }

      /*
       * Backend successfully authenticated the user.
       */
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(
        "Authentication validation failed:",
        error
      );

      clearSession();

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Logout
   |--------------------------------------------------------------------------
   */

  const logout = useCallback(() => {
    /*
     * Local legacy session is cleared here.
     *
     * HttpOnly cookie logout will be connected to the
     * backend logout endpoint in the next authentication step.
     */
    clearSession();

    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Refresh Authenticated User
   |--------------------------------------------------------------------------
   */

  const refreshUser = useCallback(async () => {
    try {
      const currentUser =
        await getCurrentUser();

      if (!currentUser) {
        clearSession();

        setUser(null);
        setIsAuthenticated(false);

        return null;
      }

      setUser(currentUser);
      setIsAuthenticated(true);

      return currentUser;
    } catch (error) {
      console.error(
        "Unable to refresh user:",
        error
      );

      clearSession();

      setUser(null);
      setIsAuthenticated(false);

      return null;
    }
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Initial Authentication Check
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /*
   |--------------------------------------------------------------------------
   | Unauthorized Event
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();

      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
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
   |--------------------------------------------------------------------------
   | Storage Changes
   |--------------------------------------------------------------------------
   |
   | This remains only for legacy localStorage session changes.
   | Cross-app authentication is handled by the backend cookie.
   |
   */

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        if (!event.newValue) {
          setUser(null);
          return;
        }

        try {
          setUser(
            JSON.parse(event.newValue)
          );
        } catch {
          setUser(null);
        }
      }

      if (event.key === "token") {
        /*
         * Do not use localStorage token as the source
         * of truth for authentication anymore.
         *
         * Re-check the backend instead.
         */
        checkAuth();
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
   |--------------------------------------------------------------------------
   | Context Value
   |--------------------------------------------------------------------------
   */

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      logout,
      refreshUser,
      checkAuth,
    }),
    [
      user,
      loading,
      isAuthenticated,
      logout,
      refreshUser,
      checkAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useAuth Hook
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;