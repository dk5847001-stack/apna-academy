import { useEffect } from "react";

const DARK_CLASS_MAP = [
  ["bg-white", "!bg-slate-950"],
  ["bg-slate-50", "!bg-slate-900"],
  ["bg-slate-50/70", "!bg-slate-900/70"],
  ["bg-slate-100", "!bg-slate-800"],
  ["bg-blue-50", "!bg-blue-950/40"],
  ["bg-emerald-50", "!bg-emerald-950/40"],
  ["bg-amber-50", "!bg-amber-950/40"],
  ["bg-violet-50", "!bg-violet-950/40"],
  ["border-slate-200", "!border-slate-800"],
  ["border-slate-100", "!border-slate-800"],
  ["border-blue-100", "!border-blue-900"],
  ["text-slate-950", "!text-slate-100"],
  ["text-slate-900", "!text-slate-100"],
  ["text-slate-800", "!text-slate-200"],
  ["text-slate-700", "!text-slate-300"],
  ["text-slate-600", "!text-slate-400"],
  ["text-slate-500", "!text-slate-400"],
  ["text-slate-400", "!text-slate-500"],
];

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

function applyMuiDarkTheme() {
  const dark = isDark();

  document.querySelectorAll(
    ".MuiAppBar-root, .MuiDrawer-paper, .MuiMenu-paper, .MuiPopover-paper"
  ).forEach((element) => {
    if (dark) {
      if (!element.dataset.apnaOriginalBg) {
        element.dataset.apnaOriginalBg = element.style.backgroundColor || "";
      }
      if (!element.dataset.apnaOriginalColor) {
        element.dataset.apnaOriginalColor = element.style.color || "";
      }
      element.style.backgroundColor = "#0f172a";
      element.style.color = "#f8fafc";
      element.style.borderColor = "#1e293b";
    } else {
      if (element.dataset.apnaOriginalBg !== undefined) {
        element.style.backgroundColor = element.dataset.apnaOriginalBg;
        delete element.dataset.apnaOriginalBg;
      }
      if (element.dataset.apnaOriginalColor !== undefined) {
        element.style.color = element.dataset.apnaOriginalColor;
        delete element.dataset.apnaOriginalColor;
      }
    }
  });
}

function applyTheme() {
  const root = document.documentElement;
  const dark = isDark();

  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  document.body.style.backgroundColor = dark ? "#020617" : "#ffffff";
  document.body.style.color = dark ? "#f8fafc" : "#0f172a";

  if (dark) {
    applyTailwindDarkClasses();
  } else {
    removeTailwindDarkClasses();
  }

  applyMuiDarkTheme();
}

function getSearchInput() {
  return document.querySelector('input[aria-label="Search courses"]');
}

function syncCourseSearchFromUrl() {
  if (window.location.pathname !== "/courses") return;

  const query = new URLSearchParams(window.location.search).get("search");
  if (!query) return;

  const input = getSearchInput();
  if (!input) return;

  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;

  setter?.call(input, query);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function createSearchOverlay() {
  if (document.querySelector("[data-apna-search-overlay]")) return;

  const overlay = document.createElement("div");
  overlay.setAttribute("data-apna-search-overlay", "true");
  overlay.className =
    "fixed inset-0 z-[1500] flex items-start justify-center bg-slate-950/60 px-4 pt-24 backdrop-blur-sm";

  const panel = document.createElement("div");
  panel.className =
    "w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5 dark:border-slate-700 dark:bg-slate-900";

  const form = document.createElement("form");
  form.className = "flex items-center gap-3";

  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Search courses, skills, topics...";
  input.setAttribute("aria-label", "Navbar course search");
  input.autocomplete = "off";
  input.className =
    "min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className =
    "rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700";
  submit.textContent = "Search";

  const close = document.createElement("button");
  close.type = "button";
  close.className =
    "rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";
  close.textContent = "Close";

  const hint = document.createElement("p");
  hint.className =
    "mt-3 px-1 text-xs font-medium text-slate-500 dark:text-slate-400";
  hint.textContent = "Press Enter to search or Escape to close.";

  form.append(input, submit, close);
  panel.append(form, hint);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const remove = () => overlay.remove();

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) remove();
  });
  close.addEventListener("click", remove);
  document.addEventListener("keydown", function onKeyDown(event) {
    if (event.key === "Escape") {
      remove();
      document.removeEventListener("keydown", onKeyDown);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    window.location.href = `/courses?search=${encodeURIComponent(value)}`;
  });

  input.focus();
}

function findNavbarSearchButtons() {
  const desktop = document.querySelector('button[aria-label="Search courses"]');
  const mobile = Array.from(
    document.querySelectorAll(".MuiListItemButton-root")
  ).find((element) =>
    element.textContent?.trim().includes("Search Courses")
  );

  return [desktop, mobile].filter(Boolean);
}

function installSearchHandlers() {
  findNavbarSearchButtons().forEach((button) => {
    if (button.dataset.apnaSearchBound === "true") return;

    button.dataset.apnaSearchBound = "true";
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        createSearchOverlay();
      },
      true
    );
  });
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
        window.setTimeout(applyTheme, 0);
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
      if (isDark()) {
        applyTailwindDarkClasses();
        applyMuiDarkTheme();
      }
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
