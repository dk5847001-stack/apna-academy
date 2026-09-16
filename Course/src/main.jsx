import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";

import "./index.css";
import App from "./App";
import CertificatePreviewMount from "./components/CertificatePreviewMount";

function CourseLearningViewportLock() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isLearningRoute = /^\/courses\/[^/]+\/learn(?:\/|$)/.test(pathname);

    document.body.classList.toggle("apna-course-learning-page", isLearningRoute);

    return () => {
      document.body.classList.remove("apna-course-learning-page");
    };
  }, [pathname]);

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
