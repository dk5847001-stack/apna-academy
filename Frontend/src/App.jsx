import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarFunctionality from "./components/NavbarFunctionality";
import AuthNavbarSync from "./components/AuthNavbarSync";
import PublicSiteEnhancements from "./components/PublicSiteEnhancements";
import SeoManager from "./components/SeoManager";
import AppRoutes from "./routes/AppRoutes";
import AIAssistant from "./components/AIAssistant";

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
        'a[href="/blog"]:not(footer[data-premium-footer="true"] a), a[data-apna-blog="true"]:not(footer[data-premium-footer="true"] a)'
      );

      const isBlogActive = location.pathname === "/blog";
      const className = isBlogActive
        ? BLOG_ACTIVE_CLASSES
        : BLOG_INACTIVE_CLASSES;

      links.forEach((link) => {
        link.className = className;
        link.setAttribute("aria-current", isBlogActive ? "page" : "false");
      });
    };

    const handleBlogClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest(
        'a[href="/blog"], a[data-apna-blog="true"]'
      );
      if (!link || link.closest('footer[data-premium-footer="true"]')) return;

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

function CompanyMarqueeEnhancement() {
  useEffect(() => {
    let cleanup = () => {};
    let setupComplete = false;

    const setup = () => {
      if (setupComplete) return true;

      const sections = [...document.querySelectorAll("section")];
      const section = sections.find((item) =>
        item.textContent?.includes("Companies students aspire to join")
      );

      if (!section) return false;

      const grid = [...section.querySelectorAll("div")].find(
        (element) =>
          element.classList.contains("mt-10") &&
          element.classList.contains("grid") &&
          element.classList.contains("grid-cols-2") &&
          element.classList.contains("sm:grid-cols-4") &&
          element.classList.contains("lg:grid-cols-8")
      );

      if (!grid || !grid.children.length) return false;

      const cards = [...grid.children];
      if (cards.length < 2) return false;

      setupComplete = true;
      grid.dataset.apnaCompanyMarquee = "true";
      grid.className =
        "relative mt-10 overflow-hidden rounded-3xl py-5 [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]";

      const track = document.createElement("div");
      track.className = "flex w-max gap-4 will-change-transform";

      cards.forEach((card) => {
        card.classList.remove(
          "grid-cols-2",
          "sm:grid-cols-4",
          "lg:grid-cols-8"
        );
        card.classList.add(
          "w-[220px]",
          "shrink-0",
          "sm:w-[240px]",
          "lg:w-[260px]",
          "origin-center",
          "transform-gpu",
          "transition-[transform,box-shadow,filter,opacity]",
          "duration-500",
          "ease-out",
          "scale-100",
          "shadow-sm",
          "z-0"
        );
      });

      const clones = cards.map((card) => card.cloneNode(true));
      track.append(...cards, ...clones);
      grid.replaceChildren(track);

      const allTrackCards = [...track.children];

      const updateCenterFocus = () => {
        const gridRect = grid.getBoundingClientRect();
        const centerX = gridRect.left + gridRect.width / 2;
        let closestCard = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        allTrackCards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const distance = Math.abs(cardCenter - centerX);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestCard = card;
          }

          card.classList.remove(
            "scale-110",
            "-translate-y-2",
            "shadow-2xl",
            "z-20",
            "brightness-105"
          );
          card.classList.add("scale-100", "shadow-sm", "z-0");
        });

        if (closestCard && closestDistance <= gridRect.width * 0.18) {
          closestCard.classList.remove("scale-100", "shadow-sm", "z-0");
          closestCard.classList.add(
            "scale-110",
            "-translate-y-2",
            "shadow-2xl",
            "z-20",
            "brightness-105"
          );
        }
      };

      const leftFade = document.createElement("div");
      leftFade.className =
        "pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-20";

      const rightFade = document.createElement("div");
      rightFade.className =
        "pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-20";

      const centerGlow = document.createElement("div");
      centerGlow.className =
        "pointer-events-none absolute inset-y-2 left-1/2 z-10 w-40 -translate-x-1/2 rounded-full bg-blue-100/20 blur-3xl sm:w-56";

      grid.append(centerGlow, leftFade, rightFade);

      let offset = 0;
      let animationFrame = null;
      let lastTime = performance.now();
      const speed = 34;

      const getLoopWidth = () => {
        const firstSetCount = cards.length;
        const firstCard = track.children[0];
        const firstCardOfSecondSet = track.children[firstSetCount];

        if (!firstCard || !firstCardOfSecondSet) return 0;
        return firstCardOfSecondSet.offsetLeft - firstCard.offsetLeft;
      };

      const animate = (now) => {
        const delta = Math.min(now - lastTime, 50);
        lastTime = now;

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          offset -= (speed * delta) / 1000;

          const loopWidth = getLoopWidth();
          if (loopWidth > 0 && -offset >= loopWidth) {
            offset += loopWidth;
          }

          track.style.transform = `translate3d(${offset}px, 0, 0)`;
          updateCenterFocus();
        }

        animationFrame = window.requestAnimationFrame(animate);
      };

      updateCenterFocus();
      animationFrame = window.requestAnimationFrame(animate);

      const handleResize = () => updateCenterFocus();
      window.addEventListener("resize", handleResize, { passive: true });

      cleanup = () => {
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
        }
        window.removeEventListener("resize", handleResize);
      };

      return true;
    };

    if (!setup()) {
      const observer = new MutationObserver(() => {
        if (setup()) observer.disconnect();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      cleanup = () => observer.disconnect();
    }

    return () => cleanup();
  }, []);

  return null;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <SeoManager />
      <BlogNavigationGuard />
      <CompanyMarqueeEnhancement />
      <NavbarFunctionality />
      <AuthNavbarSync />
      <PublicSiteEnhancements />
      <AppRoutes />
      <AIAssistant />
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
