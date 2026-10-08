import { useEffect } from "react";

const DARK_CLASS_MAP = [
  ["bg-white", "aa-dark-surface"],
  ["bg-slate-50", "aa-dark-surface-raised"],
  ["bg-slate-50/70", "aa-dark-surface-raised-soft"],
  ["bg-slate-100", "aa-dark-surface-elevated"],
  ["bg-blue-50", "aa-dark-primary-soft"],
  ["bg-emerald-50", "aa-dark-success-soft"],
  ["bg-amber-50", "aa-dark-warning-soft"],
  ["bg-violet-50", "aa-dark-secondary-soft"],
  ["border-slate-200", "aa-dark-border"],
  ["border-slate-100", "aa-dark-border"],
  ["border-blue-100", "aa-dark-primary-border"],
  ["text-slate-950", "aa-dark-text-primary"],
  ["text-slate-900", "aa-dark-text-primary"],
  ["text-slate-800", "aa-dark-text-secondary"],
  ["text-slate-700", "aa-dark-text-secondary"],
  ["text-slate-600", "aa-dark-text-muted"],
  ["text-slate-500", "aa-dark-text-muted"],
  ["text-slate-400", "aa-dark-text-subtle"],
];

const THEME_STYLE_ID = "apna-navbar-theme-runtime";
const SEARCH_INPUT_SELECTOR = '[data-apna-navbar-search-input="true"]';

function isDark() {
  return localStorage.getItem("theme") === "dark";
}

function applyTailwindDarkClasses() {
  document.querySelectorAll("*").forEach((element) => {
    DARK_CLASS_MAP.forEach(([lightClass, darkClass]) => {
      if (element.classList.contains(lightClass)) {
        element.classList.add(darkClass);
      }
    });
  });
}

function removeTailwindDarkClasses() {
  document.querySelectorAll("*").forEach((element) => {
    DARK_CLASS_MAP.forEach(([, darkClass]) => {
      element.classList.remove(darkClass);
    });
  });
}

function ensureThemeStyles() {
  if (document.getElementById(THEME_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = THEME_STYLE_ID;
  style.textContent = `
    html.dark .MuiAppBar-root {
      background-color: var(--aa-surface) !important;
      color: var(--aa-text-primary) !important;
      border-bottom-color: var(--aa-border) !important;
    }

    html:not(.dark) .MuiAppBar-root {
      background-color: var(--aa-surface) !important;
      color: var(--aa-text-primary) !important;
      border-bottom-color: var(--aa-border) !important;
    }

    html.dark .MuiAppBar-root button[aria-label="Search courses"],
    html.dark .MuiAppBar-root button[aria-label="Toggle theme"],
    html.dark .MuiAppBar-root button[aria-label="Notifications"] {
      background-color: var(--aa-surface) !important;
      color: var(--aa-text-secondary) !important;
    }

    html:not(.dark) .MuiAppBar-root button[aria-label="Search courses"],
    html:not(.dark) .MuiAppBar-root button[aria-label="Toggle theme"],
    html:not(.dark) .MuiAppBar-root button[aria-label="Notifications"] {
      background-color: var(--aa-surface) !important;
      color: var(--aa-text-secondary) !important;
    }

    html.dark .MuiAppBar-root button[aria-label="Search courses"]:hover,
    html.dark .MuiAppBar-root button[aria-label="Toggle theme"]:hover,
    html.dark .MuiAppBar-root button[aria-label="Notifications"]:hover {
      background-color: var(--aa-surface-elevated) !important;
      color: var(--aa-primary-hover) !important;
    }

    html:not(.dark) .MuiAppBar-root button[aria-label="Search courses"]:hover,
    html:not(.dark) .MuiAppBar-root button[aria-label="Toggle theme"]:hover,
    html:not(.dark) .MuiAppBar-root button[aria-label="Notifications"]:hover {
      background-color: var(--aa-primary-soft) !important;
      color: var(--aa-primary-hover) !important;
    }

    [data-apna-navbar-search-wrap="true"] {
      position: relative;
      display: flex;
      align-items: center;
      flex-shrink: 1;
    }

    [data-apna-navbar-search-input="true"] {
      width: 0;
      min-width: 0;
      height: 40px;
      opacity: 0;
      pointer-events: none;
      border: 1px solid transparent;
      border-radius: 12px;
      outline: none;
      padding: 0;
      margin-right: 0;
      font-size: 14px;
      font-weight: 600;
      transition:
        width 260ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 180ms ease,
        padding 260ms cubic-bezier(0.4, 0, 0.2, 1),
        margin-right 260ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color 180ms ease;
    }

    [data-apna-navbar-search-wrap="true"][data-open="true"] [data-apna-navbar-search-input="true"] {
      width: min(260px, 30vw);
      opacity: 1;
      pointer-events: auto;
      padding: 0 42px 0 14px;
      margin-right: -40px;
      border-color: var(--aa-input-border);
    }

    html.dark [data-apna-navbar-search-input="true"] {
      background: var(--aa-input);
      color: var(--aa-text-primary);
      border-color: var(--aa-input-border);
    }

    html:not(.dark) [data-apna-navbar-search-input="true"] {
      background: var(--aa-surface-raised);
      color: var(--aa-text-primary);
    }

    [data-apna-navbar-search-input="true"]::placeholder {
      color: var(--aa-text-subtle);
    }

    [data-apna-navbar-search-wrap="true"][data-open="true"] button[aria-label="Search courses"] {
      position: relative;
      z-index: 2;
    }

    @media (max-width: 639px) {
      [data-apna-navbar-search-wrap="true"][data-open="true"] [data-apna-navbar-search-input="true"] {
        width: min(180px, 48vw);
      }
    }
  `;

  document.head.appendChild(style);
}

function applyTheme() {
  const root = document.documentElement;
  const dark = isDark();

  ensureThemeStyles();
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document.body.style.backgroundColor = "var(--aa-page)";
  document.body.style.color = "var(--aa-text-primary)";

  if (dark) {
    applyTailwindDarkClasses();
  } else {
    removeTailwindDarkClasses();
  }
}

function getCourseSearchInput() {
  return document.querySelector('input[aria-label="Search courses"]');
}

function syncCourseSearchFromUrl() {
  if (window.location.pathname !== "/courses") return;

  const query = new URLSearchParams(window.location.search).get("search");
  if (!query) return;

  const input = getCourseSearchInput();
  if (!input) return;

  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;

  setter?.call(input, query);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function submitNavbarSearch(input) {
  const value = input.value.trim();
  if (!value) {
    input.focus();
    return;
  }

  window.location.href = `/courses?search=${encodeURIComponent(value)}`;
}

function createNavbarSearchInput(button) {
  if (!button || button.dataset.apnaSearchContainerBound === "true") {
    return;
  }

  const parent = button.parentElement;
  if (!parent) return;

  let wrap = parent.querySelector('[data-apna-navbar-search-wrap="true"]');

  if (!wrap) {
    wrap = document.createElement("div");
    wrap.setAttribute("data-apna-navbar-search-wrap", "true");
    wrap.setAttribute("data-open", "false");

    parent.insertBefore(wrap, button);
    wrap.appendChild(button);
  }

  let input = wrap.querySelector(SEARCH_INPUT_SELECTOR);

  if (!input) {
    input = document.createElement("input");
    input.type = "search";
    input.placeholder = "Search courses...";
    input.setAttribute("aria-label", "Navbar course search");
    input.setAttribute("data-apna-navbar-search-input", "true");
    input.autocomplete = "off";
    wrap.insertBefore(input, button);

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitNavbarSearch(input);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeNavbarSearch(wrap, input);
      }
    });
  }

  button.dataset.apnaSearchContainerBound = "true";
  button.dataset.apnaSearchBound = "true";

  button.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const open = wrap.getAttribute("data-open") === "true";
      if (open) {
        closeNavbarSearch(wrap, input);
      } else {
        openNavbarSearch(wrap, input);
      }
    },
    true
  );
}

function openNavbarSearch(wrap, input) {
  wrap.setAttribute("data-open", "true");
  window.requestAnimationFrame(() => {
    input.focus();
  });
}

function closeNavbarSearch(wrap, input) {
  wrap.setAttribute("data-open", "false");
  input.value = "";
}

function findDesktopSearchButton() {
  return document.querySelector('button[aria-label="Search courses"]');
}

function findMobileSearchButton() {
  return Array.from(document.querySelectorAll(".MuiListItemButton-root")).find(
    (element) => element.textContent?.trim().includes("Search Courses")
  );
}

function installSearchHandlers() {
  const desktop = findDesktopSearchButton();

  if (desktop) {
    createNavbarSearchInput(desktop);
  }

  const mobile = findMobileSearchButton();

  if (mobile && mobile.dataset.apnaMobileSearchBound !== "true") {
    mobile.dataset.apnaMobileSearchBound = "true";
    mobile.addEventListener(
      "click",
      () => {
        window.setTimeout(() => {
          const input = document.querySelector(SEARCH_INPUT_SELECTOR);
          if (input) input.focus();
        }, 0);
      },
      true
    );
  }
}

function installThemeHandler() {
  const desktop = document.querySelector('button[aria-label="Toggle theme"]');
  const mobile = Array.from(
    document.querySelectorAll(".MuiListItemButton-root")
  ).find((element) => {
    const text = element.textContent?.trim() || "";
    return text === "Dark Mode" || text === "Light Mode";
  });

  [desktop, mobile].filter(Boolean).forEach((button) => {
    if (button.dataset.apnaThemeBound === "true") return;

    button.dataset.apnaThemeBound = "true";
    button.addEventListener(
      "click",
      () => {
        // MainLayout owns the React theme state. Re-apply the runtime
        // stylesheet after React updates localStorage/root.dark.
        window.setTimeout(applyTheme, 0);
        window.setTimeout(applyTheme, 40);
        window.setTimeout(applyTheme, 150);
      },
      true
    );
  });
}

export default function NavbarFunctionality() {
  useEffect(() => {
    applyTheme();
    installSearchHandlers();
    installThemeHandler();
    syncCourseSearchFromUrl();

    const observer = new MutationObserver(() => {
      installSearchHandlers();
      installThemeHandler();

      // Keep the runtime theme authoritative after React/MUI rerenders.
      applyTheme();
      syncCourseSearchFromUrl();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const onStorage = (event) => {
      if (event.key === "theme") applyTheme();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
