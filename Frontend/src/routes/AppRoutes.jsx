import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import About from "../pages/About";
import Blog from "../pages/Blog";
import ContactNew from "../pages/ContactNew";
import Courses from "../pages/Courses";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import RefundPolicy from "../pages/RefundPolicy";
import Register from "../pages/Register";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactNew />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
