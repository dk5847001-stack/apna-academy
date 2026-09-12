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
  hasToken,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  const [loading, setLoading] = useState(() =>
    hasToken()
  );

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => hasToken());

  /**
   * Validate the current session with backend.
   */
  const checkAuth = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const currentUser = await getCurrentUser();

      if (!currentUser) {
        clearSession();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

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

  /**
   * Logout current user.
   */
  const logout = useCallback(() => {
    clearSession();

    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Refresh authenticated user.
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();

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

  /**
   * Initial authentication check.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Handle unauthorized events from Axios interceptor.
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

  /**
   * Handle authentication changes from another
   * browser tab/window.
   */
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key === "token" ||
        event.key === "user"
      ) {
        if (!event.newValue) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        if (event.key === "user") {
          try {
            setUser(
              event.newValue
                ? JSON.parse(event.newValue)
                : null
            );
          } catch {
            setUser(null);
          }
        }

        if (event.key === "token") {
          setIsAuthenticated(
            Boolean(event.newValue)
          );
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
  }, []);

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

/**
 * Access authentication state anywhere
 * inside AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;