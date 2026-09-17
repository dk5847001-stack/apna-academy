import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const About = lazy(() => import("../pages/AboutPremium"));
const Blog = lazy(() => import("../pages/Blog"));
const ContactNew = lazy(() => import("../pages/ContactNew"));
const Courses = lazy(() => import("../pages/Courses"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const NotFound = lazy(() => import("../pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Pricing = lazy(() => import("../pages/Pricing"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const Register = lazy(() => import("../pages/Register"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4" role="status" aria-live="polite">
      <span className="text-sm font-medium text-slate-500">Loading page…</span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactNew />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
