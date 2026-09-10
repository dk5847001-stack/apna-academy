import { Routes, Route } from "react-router-dom";

import CourseDetails from "./pages/CourseDetails";
import CoursePlayerLayout from "./layouts/CoursePlayerLayout";

function CourseHome() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          ApnaAcademy
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-6xl">
          Courses
        </h1>

        <p className="mt-4 text-slate-400">
          Select a course to start learning.
        </p>
      </div>
    </div>
  );
}

function CoursePlayerPage() {
  return (
    <CoursePlayerLayout
      courseTitle="Full Stack Web Development"
      progress={80}
      onBack={() => window.history.back()}
      onPrevious={() => console.log("Previous video")}
      onNext={() => console.log("Next video")}
      onVideoSelect={(video) => {
        console.log("Selected video:", video);
      }}
    />
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <p className="text-6xl font-black text-blue-500">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold">
          Page not found
        </h1>

        <p className="mt-2 text-slate-400">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Course Home */}
      <Route
        path="/"
        element={<CourseHome />}
      />

      {/* Course Details */}
      <Route
        path="/courses/:slug"
        element={<CourseDetails />}
      />

      {/* Course Player */}
      <Route
        path="/courses/:slug/learn"
        element={<CoursePlayerPage />}
      />

      {/* Specific Video */}
      <Route
        path="/courses/:slug/learn/:videoId"
        element={<CoursePlayerPage />}
      />

      {/* Certificate */}
      <Route
        path="/courses/:slug/certificate"
        element={<CoursePlayerPage />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}