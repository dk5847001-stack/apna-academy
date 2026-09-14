import {
  ADMIN_URL,
  API_BASE_URL,
  DASHBOARD_URL,
} from "../constants/config";

const DESKTOP_ATTR = "data-apna-auth-actions";
const MOBILE_ATTR = "data-apna-mobile-auth-actions";

async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return payload?.data || null;
  } catch {
    return null;
  }
}

async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    // Even if the request fails, clear the local navbar state below.
  }

  window.dispatchEvent(new Event("apnaacademy-auth-change"));
  window.location.href = "/";
}

function createActionButton({ label, primary = false, danger = false, onClick }) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.style.minHeight = "40px";
  button.style.padding = "0 14px";
  button.style.borderRadius = "9px";
  button.style.border = danger
    ? "1px solid #fecaca"
    : primary
      ? "1px solid #0f172a"
      : "1px solid #bfdbfe";
  button.style.background = danger
    ? "#ffffff"
    : primary
      ? "#0f172a"
      : "#ffffff";
  button.style.color = danger
    ? "#dc2626"
    : primary
      ? "#ffffff"
      : "#1d4ed8";
  button.style.fontSize = "14px";
  button.style.fontWeight = "700";
  button.style.fontFamily = "inherit";
  button.style.cursor = "pointer";
  button.style.boxShadow = "none";
  button.addEventListener("mouseenter", () => {
    button.style.background = danger
      ? "#fef2f2"
      : primary
        ? "#1e293b"
        : "#eff6ff";
  });
  button.addEventListener("mouseleave", () => {
    button.style.background = danger
      ? "#ffffff"
      : primary
        ? "#0f172a"
        : "#ffffff";
  });
  button.addEventListener("click", onClick);

  return button;
}

function hidePublicAuthButtons(root) {
  if (!root) return;

  root.querySelectorAll("button").forEach((button) => {
    const text = button.textContent?.trim();

    if (text === "Login" || text === "Get Started" || text === "Register") {
      if (button.dataset.apnaOriginalDisplay === undefined) {
        button.dataset.apnaOriginalDisplay = button.style.display || "";
      }
      button.style.display = "none";
    }
  });
}

function restorePublicAuthButtons() {
  document.querySelectorAll("button").forEach((button) => {
    const text = button.textContent?.trim();

    if (
      (text === "Login" || text === "Get Started" || text === "Register") &&
      button.dataset.apnaOriginalDisplay !== undefined
    ) {
      button.style.display = button.dataset.apnaOriginalDisplay;
      delete button.dataset.apnaOriginalDisplay;
    }
  });

  document
    .querySelectorAll(`[${DESKTOP_ATTR}], [${MOBILE_ATTR}]`)
    .forEach((element) => element.remove());
}

function installDesktopActions(user) {
  const header = document.querySelector("header");
  const toolbar = header?.querySelector(".MuiToolbar-root");
  if (!toolbar) return;

  const actions = Array.from(toolbar.children).find(
    (element) =>
      element.classList.contains("ml-auto") &&
      element.classList.contains("flex")
  );
  if (!actions) return;

  hidePublicAuthButtons(actions);

  let container = actions.querySelector(`[${DESKTOP_ATTR}]`);

  if (!container) {
    container = document.createElement("div");
    container.setAttribute(DESKTOP_ATTR, "true");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "8px";
    container.style.marginLeft = "4px";

    const mobileMenu = actions.querySelector('button[aria-label="Open menu"]');
    if (mobileMenu) actions.insertBefore(container, mobileMenu);
    else actions.appendChild(container);
  }

  if (!container.querySelector("[data-apna-dashboard]")) {
    const dashboard = createActionButton({
      label: "Dashboard",
      onClick: () => {
        window.location.href = DASHBOARD_URL;
      },
    });
    dashboard.setAttribute("data-apna-dashboard", "true");
    container.appendChild(dashboard);
  }

  if (user?.role === "admin" && !container.querySelector("[data-apna-admin]")) {
    const admin = createActionButton({
      label: "Admin",
      primary: true,
      onClick: () => {
        window.location.href = ADMIN_URL;
      },
    });
    admin.setAttribute("data-apna-admin", "true");
    container.appendChild(admin);
  }

  if (!container.querySelector("[data-apna-logout]")) {
    const logout = createActionButton({
      label: "Logout",
      danger: true,
      onClick: logoutUser,
    });
    logout.setAttribute("data-apna-logout", "true");
    container.appendChild(logout);
  }

  if (user?.role !== "admin") {
    container.querySelector("[data-apna-admin]")?.remove();
  }
}

function installMobileActions(user) {
  const drawer = document.querySelector(".MuiDrawer-paper");
  if (!drawer) return;

  hidePublicAuthButtons(drawer);

  const list = drawer.querySelector(".MuiList-root");
  if (!list) return;

  let container = list.querySelector(`[${MOBILE_ATTR}]`);

  if (!container) {
    container = document.createElement("div");
    container.setAttribute(MOBILE_ATTR, "true");
    container.style.marginTop = "12px";
    container.style.paddingTop = "12px";
    container.style.borderTop = "1px solid #e2e8f0";
    list.appendChild(container);
  }

  if (!container.querySelector("[data-apna-dashboard]")) {
    const dashboard = createActionButton({
      label: "Dashboard",
      onClick: () => {
        window.location.href = DASHBOARD_URL;
      },
    });
    dashboard.style.width = "100%";
    dashboard.setAttribute("data-apna-dashboard", "true");
    container.appendChild(dashboard);
  }

  if (user?.role === "admin" && !container.querySelector("[data-apna-admin]")) {
    const admin = createActionButton({
      label: "Admin",
      primary: true,
      onClick: () => {
        window.location.href = ADMIN_URL;
      },
    });
    admin.style.width = "100%";
    admin.style.marginTop = "8px";
    admin.setAttribute("data-apna-admin", "true");
    container.appendChild(admin);
  }

  if (!container.querySelector("[data-apna-logout]")) {
    const logout = createActionButton({
      label: "Logout",
      danger: true,
      onClick: logoutUser,
    });
    logout.style.width = "100%";
    logout.style.marginTop = "8px";
    logout.setAttribute("data-apna-logout", "true");
    container.appendChild(logout);
  }

  if (user?.role !== "admin") {
    container.querySelector("[data-apna-admin]")?.remove();
  }
}

function applyAuthenticatedNavbar(user) {
  document.documentElement.dataset.apnaAuthenticated = "true";
  installDesktopActions(user);
  installMobileActions(user);
}

function clearAuthenticatedNavbar() {
  delete document.documentElement.dataset.apnaAuthenticated;
  restorePublicAuthButtons();
}

let initialized = false;

export default function AuthNavbarSync() {
  if (initialized) return null;
  initialized = true;

  let currentUser = null;

  const syncWithUser = async () => {
    const user = await getCurrentUser();
    currentUser = user;

    if (user) applyAuthenticatedNavbar(user);
    else clearAuthenticatedNavbar();
  };

  syncWithUser();

  const observer = new MutationObserver(() => {
    if (currentUser) applyAuthenticatedNavbar(currentUser);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  const handleAuthChange = () => {
    window.setTimeout(syncWithUser, 350);
  };

  window.addEventListener("apnaacademy-auth-change", handleAuthChange);

  return null;
}
