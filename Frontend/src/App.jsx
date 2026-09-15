import { useEffect } from "react";
import {
  BrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AuthNavbarSync from "./components/AuthNavbarSync";
import NavbarFunctionality from "./components/NavbarFunctionality";
import PublicSiteEnhancements from "./components/PublicSiteEnhancements";
import AppRoutes from "./routes/AppRoutes";

const BLOG_INACTIVE_CLASSES =
  "rounded-lg px-3.5 py-2 text-sm font-semibold no-underline transition-colors duration-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700";

const BLOG_ACTIVE_CLASSES =
  "rounded-lg px-3.5 py-2 text-sm font-semibold no-underline transition-colors duration-200 bg-blue-50 text-blue-700";

function BlogNavigationGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncBlogStyles = () => {
      const links = document.querySelectorAll(
        'a[href="/blog"], a[data-apna-blog="true"]'
      );

      const isBlogActive = location.pathname === "/blog";
      const className = isBlogActive
        ? BLOG_ACTIVE_CLASSES
        : BLOG_INACTIVE_CLASSES;

      links.forEach((link) => {
        link.className = className;
        link.setAttribute(
          "aria-current",
          isBlogActive ? "page" : "false"
        );
      });
    };

    const handleBlogClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest(
        'a[href="/blog"], a[data-apna-blog="true"]'
      );
      if (!link) {
        return;
      }

      event.preventDefault();
      navigate("/blog");
    };

    syncBlogStyles();

    const observer = new MutationObserver(() => {
      syncBlogStyles();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    document.addEventListener("click", handleBlogClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleBlogClick);
    };
  }, [location.pathname, navigate]);

  return null;
}

function AppContent() {
  return (
    <>
      <BlogNavigationGuard />
      <NavbarFunctionality />
      <AuthNavbarSync />
      <PublicSiteEnhancements />
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
