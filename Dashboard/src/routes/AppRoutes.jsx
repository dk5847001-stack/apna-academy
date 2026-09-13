import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/DashboardHome";
import AllCourses from "../pages/AllCourses";
import MyCourses from "../pages/MyCourses";
import Purchases from "../pages/Purchases";
import Progress from "../pages/Progress";
import Certificates from "../pages/Certificates";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "../constants/config";

const PlaceholderPage = ({ title }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        This section is coming next.
      </p>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardHome />} />
          <Route path={ROUTES.COURSES} element={<AllCourses />} />
          <Route path={ROUTES.MY_COURSES} element={<MyCourses />} />
          <Route path={ROUTES.PURCHASES} element={<Purchases />} />
          <Route path={ROUTES.PROGRESS} element={<Progress />} />
          <Route path={ROUTES.CERTIFICATES} element={<Certificates />} />

          <Route
            path={ROUTES.NOTIFICATIONS}
            element={<PlaceholderPage title="Notifications" />}
          />
          <Route
            path={ROUTES.PROFILE}
            element={<PlaceholderPage title="Profile" />}
          />
          <Route
            path={ROUTES.SUPPORT}
            element={<PlaceholderPage title="Support" />}
          />
        </Route>
      </Route>

      <Route
        path="/auth-required"
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
      />

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
