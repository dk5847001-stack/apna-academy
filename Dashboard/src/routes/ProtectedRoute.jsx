import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  /*
   * Wait until the initial authentication
   * check with the backend is completed.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /*
   * User is not authenticated.
   *
   * Dashboard is a private application, so
   * unauthenticated users must not access it.
   *
   * We preserve the requested path so that
   * the login flow can return the user here later.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth-required"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /*
   * Authentication is valid.
   * Render the protected child route.
   */
  return <Outlet />;
}