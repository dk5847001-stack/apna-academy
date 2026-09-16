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

  const openDemoClass = () => {
    navigate(`/courses/${encodeURIComponent(slug)}/demo`);
  };

  return (
    <div
      role="dialog"
      aria-label="Demo Class"
      className="apna-demo-prompt"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 99999,
        width: "min(390px, calc(100vw - 32px))",
        border: "1px solid rgba(96,165,250,.35)",
        borderRadius: 16,
        overflow: "hidden",
        background: "linear-gradient(145deg,#0f172a,#132d4d)",
        color: "#fff",
        boxShadow: "0 30px 90px rgba(0,0,0,.55)",
      }}
    >
      <div
        style={{
          padding: "18px 20px 20px",
          background:
            "radial-gradient(circle at top right,rgba(37,99,235,.28),transparent 45%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            aria-label="Close Demo Class notification"
            onClick={() => setOpen(false)}
            style={{
              width: 34,
              height: 34,
              padding: 0,
              border: 0,
              borderRadius: 999,
              background: "rgba(255,255,255,.08)",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 24,
              lineHeight: 1,
              display: "grid",
              placeItems: "center",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "rgba(37,99,235,.18)",
            border: "1px solid rgba(96,165,250,.3)",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 30, lineHeight: 1 }}>🔒</span>
        </div>

        <div
          style={{
            fontSize: "1.35rem",
            fontWeight: 950,
            lineHeight: 1.15,
            color: "#fff",
          }}
        >
          Enjoying the demo?
        </div>

        <div
          style={{
            marginTop: 10,
            color: "#b6c4d6",
            lineHeight: 1.65,
            fontSize: ".92rem",
          }}
        >
          Continue with the free demo class to explore the course before you enroll.
        </div>

        <button
          type="button"
          onClick={openDemoClass}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "12px 18px",
            border: 0,
            borderRadius: 10,
            color: "#fff",
            fontSize: ".95rem",
            fontWeight: 950,
            cursor: "pointer",
            background: "linear-gradient(135deg,#0875ff,#1d8cff)",
            boxShadow: "0 14px 30px rgba(14,116,255,.3)",
          }}
        >
          Watch Demo Class
        </button>
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
