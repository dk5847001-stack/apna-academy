import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import PremiumFooter from "./components/PremiumFooter";
import "./index.css";

const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA enhancement is optional; the application continues normally.
    });
  });
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <PremiumFooter />
    </BrowserRouter>
  </StrictMode>
);


registerServiceWorker();
