import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import { FRONTEND_URL, ROUTES } from "../constants/config";
import MyCourses from "../pages/MyCourses";
import AllCourses from "../pages/AllCourses";

/* =========================================================
   AUTH REQUIRED
========================================================= */

function AuthRequired() {
  const handleLogin = () => {
    const dashboardPath = ROUTES.HOME;

    const loginUrl =
      `${FRONTEND_URL}/login?redirect=${encodeURIComponent(
        dashboardPath
      )}`;

    window.location.assign(loginUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <span className="text-2xl font-black">
            A
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Login Required
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Please login to your ApnaAcademy account to
          access your student dashboard.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PLACEHOLDER PAGE
========================================================= */

function PlaceholderPage({
  title,
  description,
}) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            ApnaAcademy
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ROUTES
========================================================= */

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===================================================
          PUBLIC ROUTES
      =================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to={ROUTES.HOME}
            replace
          />
        }
      />

      <Route
        path="/auth-required"
        element={<AuthRequired />}
      />

      {/* ===================================================
          PROTECTED DASHBOARD APPLICATION
      =================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Dashboard Home */}
          <Route
            path={ROUTES.HOME}
            element={
              <PlaceholderPage
                title="Student Dashboard"
                description="Manage your learning journey, courses, progress, certificates, purchases, notifications and account from one place."
              />
            }
          />

          {/* All Courses */}
          <Route
            path={ROUTES.COURSES}
            element={<AllCourses />}
          />

          {/* My Courses */}
          <Route
            path={ROUTES.MY_COURSES}
            element={<MyCourses />}
          />

          {/* Purchases */}
          <Route
            path={ROUTES.PURCHASES}
            element={
              <PlaceholderPage
                title="Purchases"
                description="View your course purchases, payment records and related documents."
              />
            }
          />

          {/* Progress */}
          <Route
            path={ROUTES.PROGRESS}
            element={
              <PlaceholderPage
                title="My Progress"
                description="Track your overall learning progress across your enrolled courses."
              />
            }
          />

          {/* Certificates */}
          <Route
            path={ROUTES.CERTIFICATES}
            element={
              <PlaceholderPage
                title="Certificates"
                description="View your earned certificates and certificate status."
              />
            }
          />

          {/* Notifications */}
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <PlaceholderPage
                title="Notifications"
                description="Stay updated with new courses, learning updates and important account notifications."
              />
            }
          />

          {/* Profile */}
          <Route
            path={ROUTES.PROFILE}
            element={
              <PlaceholderPage
                title="Profile"
                description="Manage your ApnaAcademy profile and account information."
              />
            }
          />

          {/* Support */}
          <Route
            path={ROUTES.SUPPORT}
            element={
              <PlaceholderPage
                title="Support"
                description="Contact ApnaAcademy support and manage your support requests."
              />
            }
          />
        </Route>
      </Route>

      {/* ===================================================
          UNKNOWN ROUTES
      =================================================== */

      <Route
        path="*"
        element={
          <Navigate
            to={ROUTES.HOME}
            replace
          />
        }
      />
    </Routes>
  );
}
