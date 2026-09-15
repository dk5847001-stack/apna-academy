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
import { COURSE_URL, ROUTES } from "../constants/config";

function CertificateVerificationRedirect() {
  const { certificateId } = useParams();

  window.location.replace(
    `${COURSE_URL}/certificate/verify/${encodeURIComponent(certificateId || "")}`
  );

  return null;
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

      <Route path="/auth-required" element={<Navigate to={ROUTES.HOME} replace />} />
      <Route path="/certificate/verify/:certificateId" element={<CertificateVerificationRedirect />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
