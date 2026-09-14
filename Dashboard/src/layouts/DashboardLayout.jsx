import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  Avatar,
  Badge,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { useAuth } from "../context/AuthContext";
import DashboardNotificationAlert from "../components/DashboardNotificationAlert";
import { FRONTEND_URL, ROUTES, STORAGE_KEYS } from "../constants/config";

const SIDEBAR_WIDTH = 270;
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "http://localhost:5176";

const navigationItems = [
  { label: "Dashboard", path: ROUTES.HOME, icon: DashboardIcon, end: true },
  { label: "All Courses", path: ROUTES.COURSES, icon: SchoolIcon },
  { label: "My Courses", path: ROUTES.MY_COURSES, icon: LibraryBooksIcon },
  { label: "Purchases", path: ROUTES.PURCHASES, icon: ShoppingBagIcon },
  { label: "My Progress", path: ROUTES.PROGRESS, icon: TrendingUpIcon },
  { label: "Certificates", path: ROUTES.CERTIFICATES, icon: WorkspacePremiumIcon },
  { label: "Notifications", path: ROUTES.NOTIFICATIONS, icon: NotificationsNoneIcon },
  { label: "Profile", path: ROUTES.PROFILE, icon: PersonOutlineIcon },
  { label: "Support", path: ROUTES.SUPPORT, icon: SupportAgentIcon },
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavigationItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5",
          "text-sm font-semibold transition-colors duration-200",
          isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon sx={{ fontSize: 21, color: isActive ? "#2563eb" : "#64748b" }} />
          <span className="truncate">{item.label}</span>
          {item.label === "Notifications" && <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ user, onNavigate, onLogout, darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const handleHome = () => window.location.assign(FRONTEND_URL);
  const handleAdminConsole = () => window.location.assign(ADMIN_URL);
  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
    onNavigate?.();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-18 shrink-0 items-center border-b border-slate-100 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <SchoolIcon sx={{ fontSize: 22 }} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-tight text-slate-900">ApnaAcademy</p>
            <p className="truncate text-[11px] font-medium text-slate-400">Student Dashboard</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="shrink-0 px-3 pt-4">
          <a
            href={ADMIN_URL}
            onClick={handleAdminConsole}
            className="flex w-full items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-left text-blue-800 transition-colors hover:bg-blue-100"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <AdminPanelSettingsIcon sx={{ fontSize: 21 }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold">Admin Console</span>
              <span className="block truncate text-[11px] font-medium text-blue-600">Platform administration</span>
            </span>
          </a>
          <div className="mt-3 border-t border-slate-100" />
        </div>
      )}

      <button
        type="button"
        onClick={handleProfile}
        className="mx-3 mt-4 flex w-[calc(100%-24px)] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
      >
        <Avatar src={user?.avatar || ""} alt={user?.name || "Student"} sx={{ width: 42, height: 42, fontSize: 14, fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }}>
          {getInitials(user?.name)}
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{user?.name || "Student"}</p>
          <p className="truncate text-xs text-slate-500">{user?.email || "Student account"}</p>
        </div>
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Learning</p>
        <nav className="space-y-1">
          {navigationItems.slice(0, 6).map((item) => <NavigationItem key={item.path} item={item} onNavigate={onNavigate} />)}
        </nav>

        <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Account</p>
        <nav className="space-y-1">
          {navigationItems.slice(6).map((item) => <NavigationItem key={item.path} item={item} onNavigate={onNavigate} />)}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <a href={FRONTEND_URL} className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <HomeIcon sx={{ fontSize: 21, color: "#64748b" }} />
            <span>Home</span>
          </a>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleHome} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <HomeIcon sx={{ fontSize: 18 }} /> Website
          </button>
          <button type="button" onClick={onToggleTheme} className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            {darkMode ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
        <button type="button" onClick={onLogout} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
          <LogoutIcon sx={{ fontSize: 18 }} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.body.classList.toggle("dark", darkMode);
    return () => {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    };
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEYS.THEME, next ? "dark" : "light");
      return next;
    });
  };

  const handleLogout = async () => await logout();
  const handleCloseMobile = () => setMobileOpen(false);

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-white" : "min-h-screen bg-slate-50 text-slate-900"}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white lg:block" style={{ width: SIDEBAR_WIDTH }}>
        <SidebarContent user={user} onNavigate={() => {}} onLogout={handleLogout} darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      </aside>

      <Drawer anchor="left" open={mobileOpen} onClose={handleCloseMobile} slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, maxWidth: "88vw" } } }}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-end border-b border-slate-100 px-3 py-2 lg:hidden">
            <IconButton aria-label="Close navigation" onClick={handleCloseMobile} size="small"><CloseIcon /></IconButton>
          </div>
          <div className="min-h-0 flex-1">
            <SidebarContent user={user} onNavigate={handleCloseMobile} onLogout={handleLogout} darkMode={darkMode} onToggleTheme={handleToggleTheme} />
          </div>
        </div>
      </Drawer>

      <div className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <IconButton aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px" }}><MenuIcon /></IconButton>
              <div className="hidden items-center gap-2 min-[400px]:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white"><SchoolIcon sx={{ fontSize: 18 }} /></div>
                <span className="text-sm font-extrabold text-slate-900">ApnaAcademy</span>
              </div>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-semibold text-slate-400">Student Area</p>
              <p className="truncate text-sm font-bold text-slate-800">Welcome back, {user?.name?.split(" ")[0] || "Student"}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Tooltip title="Notifications">
                <IconButton component={NavLink} to={ROUTES.NOTIFICATIONS} aria-label="Notifications"><Badge color="primary" variant="dot" overlap="circular"><NotificationsNoneIcon /></Badge></IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ my: 1.5, display: { xs: "none", sm: "block" } }} />
              <NavLink to={ROUTES.PROFILE} className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-slate-50 sm:px-2">
                <Avatar src={user?.avatar || ""} alt={user?.name || "Student"} sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: "#dbeafe", color: "#1d4ed8" }}>{getInitials(user?.name)}</Avatar>
                <span className="hidden max-w-32 truncate text-xs font-bold text-slate-700 md:block">{user?.name || "Student"}</span>
              </NavLink>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] bg-slate-50">
          <DashboardNotificationAlert />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
