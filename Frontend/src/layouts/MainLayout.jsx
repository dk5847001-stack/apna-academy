import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5175";

export default function MainLayout() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // White mode is the default
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(Boolean(token));

      try {
        const storedUser = localStorage.getItem("user");

        setUser(
          storedUser ? JSON.parse(storedUser) : null
        );
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition duration-300 group-hover:scale-105">
              <GraduationCap size={22} />

              <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
            </div>

            <div className="hidden sm:block">
              <p className="text-base font-black tracking-tight text-slate-950 dark:text-white">
                ApnaAcademy
              </p>

              <p className="text-[10px] font-semibold tracking-wide text-slate-500 dark:text-slate-500">
                LEARN • BUILD • GROW
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink
              to="/courses"
              className={navLinkClass}
            >
              Courses
            </NavLink>

            <NavLink
              to="/about"
              className={navLinkClass}
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={navLinkClass}
            >
              Contact
            </NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">

            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Search size={19} />
            </button>

            {/* Notifications */}
            {isLoggedIn && (
              <button
                type="button"
                aria-label="Notifications"
                onClick={() =>
                  navigate("/notifications")
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <Bell size={19} />

                {/* Notification indicator */}
                <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              onClick={() =>
                setDarkMode((previous) => !previous)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="ml-1 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  <LogIn size={17} />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      (previous) => !previous
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-slate-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white">
                    {(
                      user?.name ||
                      user?.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="hidden max-w-[100px] text-left xl:block">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {user?.name || "Student"}
                    </p>

                    <p className="truncate text-[10px] text-slate-500">
                      Student
                    </p>
                  </div>

                  <ChevronDown
                    size={15}
                    className="text-slate-400"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30">

                    <div className="border-b border-slate-100 px-3 py-3 dark:border-white/5">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {user?.name || "Student"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {user?.email || ""}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <User size={17} />
                      Profile
                    </Link>

                    <a
                      href={DASHBOARD_URL}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <GraduationCap size={17} />
                      Dashboard
                    </a>

                    <Link
                      to="/settings"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <Settings size={17} />
                      Settings
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-white/5" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">

            <button
              type="button"
              aria-label="Theme"
              onClick={() =>
                setDarkMode((previous) => !previous)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              onClick={() =>
                setMobileMenuOpen(
                  (previous) => !previous
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {mobileMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-950 md:hidden">
            <nav className="space-y-1">
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                <span className="flex items-center gap-3">
                  Home
                </span>
              </NavLink>

              <NavLink
                to="/courses"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Courses
              </NavLink>

              <NavLink
                to="/about"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                About
              </NavLink>

              <NavLink
                to="/contact"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                Contact
              </NavLink>

              {isLoggedIn && (
                <>
                  <a
                    href={DASHBOARD_URL}
                    onClick={closeMobileMenu}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Dashboard
                  </a>

                  <NavLink
                    to="/profile"
                    onClick={closeMobileMenu}
                    className={navLinkClass}
                  >
                    Profile
                  </NavLink>

                  <NavLink
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className={navLinkClass}
                  >
                    Notifications
                  </NavLink>
                </>
              )}
            </nav>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-white/10">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <main className="min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            {/* Brand */}
            <div className="lg:col-span-2">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                  <GraduationCap size={23} />
                </div>

                <div>
                  <p className="font-black text-slate-950 dark:text-white">
                    ApnaAcademy
                  </p>

                  <p className="text-[10px] font-semibold tracking-wide text-slate-500">
                    LEARN • BUILD • GROW
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                Build practical skills through structured
                learning, real-world projects and an
                outcome-focused learning experience.
              </p>

              <div className="mt-6 flex gap-2">
                {["LinkedIn", "GitHub", "Instagram"].map(
                  (social) => (
                    <button
                      key={social}
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      {social}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Platform
              </h3>

              <div className="mt-5 space-y-3">
                <Link
                  to="/"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Home
                </Link>

                <Link
                  to="/courses"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Courses
                </Link>

                <a
                  href={DASHBOARD_URL}
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Dashboard
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Company
              </h3>

              <div className="mt-5 space-y-3">
                <Link
                  to="/about"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  About Us
                </Link>

                <Link
                  to="/contact"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Contact
                </Link>

                <Link
                  to="/support"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Support
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Legal
              </h3>

              <div className="mt-5 space-y-3">
                <Link
                  to="/privacy"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/terms"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Terms & Conditions
                </Link>

                <Link
                  to="/refund"
                  className="block text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} ApnaAcademy.
              All rights reserved.
            </p>

            <p className="font-medium">
              Designed for modern learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}