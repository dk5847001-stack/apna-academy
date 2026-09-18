import { useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/DashboardHome";
import AllCourses from "../pages/AllCourses";
import MyCourses from "../pages/MyCourses";
import Purchases from "../pages/Purchases";
import Progress from "../pages/Progress";
import Certificates from "../pages/Certificates";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";
import Support from "../pages/Support";
import ProtectedRoute from "./ProtectedRoute";
import { COURSE_URL, FRONTEND_URL, ROUTES } from "../constants/config";

function CertificateVerificationRedirect() {
  const { certificateId } = useParams();

  window.location.replace(
    `${COURSE_URL}/certificate/verify/${encodeURIComponent(certificateId || "")}`
  );

  return null;
}

function AuthRequired() {
  useEffect(() => {
    const returnUrl = window.location.href;
    const loginUrl = `${FRONTEND_URL}/login?redirect=${encodeURIComponent(returnUrl)}`;

    window.location.replace(loginUrl);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white">
          A
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-slate-900">
          Authentication required
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Redirecting you to the ApnaAcademy login page...
        </p>
        <a
          href={`${FRONTEND_URL}/login?redirect=${encodeURIComponent(window.location.href)}`}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Continue to Login
        </a>
      </div>
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path={ROUTES.HOME} element={<DashboardHome />} />
          <Route path={ROUTES.COURSES} element={<AllCourses />} />
          <Route path={ROUTES.MY_COURSES} element={<MyCourses />} />
          <Route path={ROUTES.PURCHASES} element={<Purchases />} />
          <Route path={ROUTES.PROGRESS} element={<Progress />} />
          <Route path={ROUTES.CERTIFICATES} element={<Certificates />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SUPPORT} element={<Support />} />
        </Route>
      </Route>

      <Route path="/auth-required" element={<AuthRequired />} />
      <Route
        path="/certificate/verify/:certificateId"
        element={<CertificateVerificationRedirect />}
      />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
