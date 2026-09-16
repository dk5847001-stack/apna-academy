import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";

import "./index.css";
import App from "./App";
import CertificatePreviewMount from "./components/CertificatePreviewMount";

function CourseLearningViewportLock() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isCoursePlayerRoute = /^\/courses\/[^/]+\/(?:learn|demo)(?:\/|$)/.test(pathname);
    const isCourseDetailsRoute = /^\/courses\/[^/]+\/?$/.test(pathname);

    document.body.classList.toggle("apna-course-learning-page", isCoursePlayerRoute);
    document.body.classList.toggle("apna-course-details-page", isCourseDetailsRoute);

    return () => {
      document.body.classList.remove("apna-course-learning-page");
      document.body.classList.remove("apna-course-details-page");
    };
  }, [pathname]);

  return null;
}

function CourseDetailsDemoPrompt() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const match = pathname.match(/^\/courses\/([^/]+)\/?$/);
  const slug = match ? decodeURIComponent(match[1]) : "";
  const isCourseDetails = Boolean(slug);

  useEffect(() => {
    setOpen(false);

    if (!isCourseDetails) return undefined;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [isCourseDetails, slug]);

  useEffect(() => {
    if (!isCourseDetails) return undefined;

    const handleDemoButtonClick = (event) => {
      const button = event.target?.closest?.("button");
      if (!button) return;

      const label = button.textContent?.replace(/\s+/g, " ").trim();
      if (label !== "Watch Demo Class") return;

      event.preventDefault();
      event.stopPropagation();
      navigate(`/courses/${encodeURIComponent(slug)}/demo`);
    };

    document.addEventListener("click", handleDemoButtonClick, true);
    return () => document.removeEventListener("click", handleDemoButtonClick, true);
  }, [isCourseDetails, navigate, slug]);

  useEffect(() => {
    if (!open || !isCourseDetails) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, isCourseDetails]);

  if (!open || !isCourseDetails) return null;

  const openDemoClass = () => {
    navigate(`/courses/${encodeURIComponent(slug)}/demo`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-demo-prompt-title"
      aria-describedby="course-demo-prompt-description"
      className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md sm:p-6"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-400/30 bg-slate-950/90 shadow-[0_30px_100px_rgba(0,0,0,0.65),0_0_60px_rgba(37,99,235,0.14)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <button
          type="button"
          aria-label="Close Demo Class popup"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-2xl leading-none text-slate-300 backdrop-blur-md transition hover:scale-105 hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          ×
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-3xl shadow-[0_12px_35px_rgba(14,116,255,0.18)] backdrop-blur-xl">
            ▶
          </div>

          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
            Free Preview
          </p>

          <h2
            id="course-demo-prompt-title"
            className="text-2xl font-black leading-tight text-white sm:text-3xl"
          >
            Demo Class is ready
          </h2>

          <p
            id="course-demo-prompt-description"
            className="mt-3 max-w-sm text-sm leading-7 text-slate-300 sm:text-base"
          >
            Explore the free demo class and get a preview of the course before you enroll.
          </p>

          <button
            type="button"
            onClick={openDemoClass}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_35px_rgba(14,116,255,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(14,116,255,0.38)] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Watch Demo Class
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CourseLearningViewportLock />
      <CourseDetailsDemoPrompt />
      <App />
      <CertificatePreviewMount />
    </BrowserRouter>
  </StrictMode>
);
