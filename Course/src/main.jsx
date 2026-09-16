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

  if (!open || !isCourseDetails) return null;

  return (
    <div
      role="dialog"
      aria-label="Demo Class"
      className="apna-demo-prompt"
    >
      <button
        type="button"
        aria-label="Close Demo Class notification"
        className="apna-demo-prompt-close"
        onClick={() => setOpen(false)}
      >
        ×
      </button>

      <button
        type="button"
        className="apna-demo-prompt-action"
        onClick={() => navigate(`/courses/${encodeURIComponent(slug)}/demo`)}
      >
        <span className="apna-demo-prompt-icon">▶</span>
        <span className="apna-demo-prompt-copy">
          <strong>Demo Class</strong>
          <span>Watch the free demo class</span>
        </span>
        <span className="apna-demo-prompt-arrow">›</span>
      </button>
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
