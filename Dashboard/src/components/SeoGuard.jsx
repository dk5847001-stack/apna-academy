import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/dashboard": "Dashboard | ApnaAcademy",
  "/dashboard/courses": "All Courses | ApnaAcademy",
  "/dashboard/my-courses": "My Courses | ApnaAcademy",
  "/dashboard/purchases": "Purchases | ApnaAcademy",
  "/dashboard/progress": "Learning Progress | ApnaAcademy",
  "/dashboard/certificates": "My Certificates | ApnaAcademy",
  "/dashboard/notifications": "Notifications | ApnaAcademy",
  "/dashboard/profile": "My Profile | ApnaAcademy",
  "/dashboard/support": "Support | ApnaAcademy",
};

const ensureMeta = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

export default function SeoGuard() {
  const location = useLocation();

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || "Student Dashboard | ApnaAcademy";

    document.title = title;

    // Dashboard content is private/personalized and must never be indexed.
    ensureMeta(
      'meta[name="robots"]',
      { name: "robots" },
      "noindex, nofollow, noarchive, nosnippet, noimageindex"
    );

    ensureMeta(
      'meta[name="googlebot"]',
      { name: "googlebot" },
      "noindex, nofollow, noarchive, nosnippet, noimageindex"
    );

    ensureMeta(
      'meta[name="bingbot"]',
      { name: "bingbot" },
      "noindex, nofollow, noarchive, nosnippet, noimageindex"
    );

    // Do not expose a personalized dashboard URL as a canonical public page.
    document.head.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove());

    // Remove share metadata if another shell/plugin ever injects it.
    document.head
      .querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
      .forEach((meta) => meta.remove());
  }, [location.pathname]);

  return null;
}
