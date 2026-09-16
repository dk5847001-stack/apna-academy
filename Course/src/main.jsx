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
  const [visible, setVisible] = useState(false);

  const match = pathname.match(/^\/courses\/([^/]+)\/?$/);
  const slug = match ? decodeURIComponent(match[1]) : "";
  const isCourseDetails = Boolean(slug);

  useEffect(() => {
    setOpen(false);
    setVisible(false);

    if (!isCourseDetails) return undefined;

    const timer = window.setTimeout(() => {
      setOpen(true);
      window.requestAnimationFrame(() => setVisible(true));
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

  const closeNotification = () => {
    setVisible(false);
    window.setTimeout(() => setOpen(false), 220);
  };

  if (!open || !isCourseDetails) return null;

  const openDemoClass = () => {
    navigate(`/courses/${encodeURIComponent(slug)}/demo`);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Demo Class notification"
      className={`fixed right-5 top-5 z-[99999] w-[min(390px,calc(100vw-40px))] transform-gpu transition-all duration-300 ease-out sm:right-7 sm:top-7 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-slate-950/95 shadow-[0_18px_55px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />

        <div className="flex items-start gap-3.5 p-4 pl-5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
            </svg>
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-emerald-400">
                Available now
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>

            <h3 className="mt-1 text-[0.98rem] font-extrabold leading-tight text-white">
              Demo Class is ready
            </h3>

            <p className="mt-1.5 text-[0.78rem] leading-5 text-slate-400">
              Explore the free demo before you enroll.
            </p>

            <button
              type="button"
              onClick={openDemoClass}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-[0_8px_22px_rgba(16,185,129,0.22)] transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            >
              Watch Demo Class
              <span aria-hidden="true" className="text-sm leading-none">→</span>
            </button>
          </div>

          <button
            type="button"
            aria-label="Close Demo Class notification"
            onClick={closeNotification}
            className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-slate-500 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            ×
          </button>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-emerald-400/40 via-emerald-400/10 to-transparent" />
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
