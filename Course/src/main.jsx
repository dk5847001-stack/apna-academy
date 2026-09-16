import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import CertificatePreviewMount from "./components/CertificatePreviewMount";

function CourseLearningViewportLock() {
  useEffect(() => {
    const isLearningRoute = /^\/courses\/[^/]+\/learn(?:\/|$)/.test(window.location.pathname);

    if (!isLearningRoute) return undefined;

    document.body.classList.add("apna-course-learning-page");

    return () => {
      document.body.classList.remove("apna-course-learning-page");
    };
  }, []);

  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CourseLearningViewportLock />
      <App />
      <CertificatePreviewMount />
    </BrowserRouter>
  </StrictMode>
);
