import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Courses from "../pages/Courses";
import CourseDetails from "../pages/CourseDetails";
import VideoPreview from "../pages/VideoPreview";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          MAIN WEBSITE LAYOUT
      ====================================================== */}

      <Route element={<MainLayout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Public Course Catalog */}
        <Route
          path="/courses"
          element={<Courses />}
        />

        {/* Public Course Details */}
        <Route
          path="/courses/:slug"
          element={<CourseDetails />}
        />

        {/* Public Preview Video */}
        <Route
          path="/courses/:slug/watch/:videoId"
          element={<VideoPreview />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Company */}
        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />
      </Route>

      {/* =====================================================
          404
      ====================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}