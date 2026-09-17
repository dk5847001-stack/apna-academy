import { useState } from "react";
import {
  AutoAwesome,
  Close,
  Dashboard,
  Home,
  Menu,
  School,
  MenuBook,
} from "@mui/icons-material";
import { APP_NAME } from "../constants/config";

const FRONTEND_APP_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
const DASHBOARD_APP_URL =
  import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5175";

const navigationItems = [
  {
    label: "Home",
    description: "Main website",
    icon: Home,
    href: FRONTEND_APP_URL,
  },
  {
    label: "Dashboard",
    description: "Student area",
    icon: Dashboard,
    href: DASHBOARD_APP_URL,
  },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <a
            href={FRONTEND_APP_URL}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <School fontSize="small" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-tight text-slate-950">
                {APP_NAME}
              </span>
              <span className="block text-[11px] font-semibold text-slate-500">
                Learning Platform
              </span>
            </span>
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <Close fontSize="small" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Navigation
          </div>

          <nav className="space-y-2" aria-label="Course navigation">
            <a
              href="/"
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-blue-700 ring-1 ring-inset ring-blue-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <MenuBook fontSize="small" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">Courses</span>
                <span className="block text-[11px] font-medium text-blue-600">
                  Learning catalog
                </span>
              </span>
            </a>

            {navigationItems.map(({ label, description, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Icon fontSize="small" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold">{label}</span>
                  <span className="block truncate text-[11px] font-medium text-slate-400 group-hover:text-blue-500">
                    {description}
                  </span>
                </span>
              </a>
            ))}
          </nav>

          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <AutoAwesome fontSize="small" />
            </div>
            <p className="mt-3 text-xs font-extrabold text-slate-900">
              Learn by building.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Choose a course and continue your practical learning journey.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function CourseNavigation({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur lg:left-[280px]">
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600 lg:hidden"
            >
              <Menu fontSize="small" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:flex">
                <MenuBook fontSize="small" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  Course Library
                </p>
                <p className="hidden truncate text-[11px] font-medium text-slate-400 sm:block">
                  Explore and start learning
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {navigationItems.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:px-3"
              >
                <Icon sx={{ fontSize: 17 }} />
                <span className="hidden sm:inline">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="pt-16 lg:pl-[280px]">{children}</div>
    </div>
  );
}
