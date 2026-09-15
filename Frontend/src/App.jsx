import { useEffect } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import AuthNavbarSync from "./components/AuthNavbarSync";
import NavbarFunctionality from "./components/NavbarFunctionality";
import PublicSiteEnhancements from "./components/PublicSiteEnhancements";
import AppRoutes from "./routes/AppRoutes";

function BlogNavigationGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBlogClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest('a[href="/blog"], a[data-apna-blog="true"]');
      if (!link) {
        return;
      }

      event.preventDefault();
      navigate("/blog");
    };

    document.addEventListener("click", handleBlogClick);

    return () => {
      document.removeEventListener("click", handleBlogClick);
    };
  }, [navigate]);

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
