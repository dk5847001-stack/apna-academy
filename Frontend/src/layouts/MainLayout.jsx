import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Close,
  ContactSupport,
  Dashboard,
  DarkMode,
  InfoOutlined,
  LightMode,
  Login,
  Logout,
  Menu as MenuIcon,
  MenuBook,
  Notifications,
  Person,
  School,
  Search,
  Settings,
  SupportAgent,
  KeyboardArrowDown,
} from "@mui/icons-material";

import {
  COURSE_URL,
  DASHBOARD_URL,
  ADMIN_URL,
  DSA_URL,
} from "../constants/config";

/* ============================================================
   NAVIGATION
============================================================ */

const navItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Courses",
    path: "/courses",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Contact",
    path: "/contact",
  },
];

/* ============================================================
   HELPERS
============================================================ */

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function getInitials(user) {
  if (!user) {
    return "U";
  }

  const name =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "User";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/* ============================================================
   FOOTER COMPONENTS
============================================================ */

function FooterColumn({ title, children }) {
  return (
    <div className="min-w-0">
      <Typography
        component="h3"
        variant="subtitle2"
        sx={{
          mb: 1.5,
          color: "#0f172a",
          fontWeight: 800,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </Typography>

      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block w-fit rounded-md py-1 text-sm text-slate-600 no-underline transition-colors duration-200 hover:text-blue-700"
    >
      {children}
    </Link>
  );
}

/* ============================================================
   MAIN LAYOUT
============================================================ */

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [user, setUser] = useState(getStoredUser);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const isLoggedIn = Boolean(localStorage.getItem("token") && user);
  const profileOpen = Boolean(profileAnchor);
  const notificationOpen = Boolean(notificationAnchor);
  const moreOpen = Boolean(moreAnchor);

  /* ==========================================================
     AUTH STATE SYNC
  ========================================================== */

  useEffect(() => {
    const syncAuth = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    const syncCurrentAuth = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("apnaacademy-auth-change", syncCurrentAuth);

    return () => {
      window.removeEventListener("apnaacademy-auth-change", syncCurrentAuth);
    };
  }, []);

  /* ==========================================================
     THEME
  ========================================================== */

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  /* ==========================================================
     CLOSE MOBILE MENU WHEN ROUTE CHANGES
  ========================================================== */

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* ==========================================================
     NAVIGATION HELPERS
  ========================================================== */

  const closeMobileMenu = () => setMobileOpen(false);
  const closeProfileMenu = () => setProfileAnchor(null);
  const closeNotificationMenu = () => setNotificationAnchor(null);
  const closeMoreMenu = () => setMoreAnchor(null);

  const handleCourses = () => {
    closeMobileMenu();
    navigate("/courses");
  };

  const handleLogin = () => {
    closeMobileMenu();
    navigate("/login");
  };

  const handleRegister = () => {
    closeMobileMenu();
    navigate("/register");
  };

  /* ==========================================================
     EXTERNAL APP NAVIGATION
  ========================================================== */

  const handleDashboard = () => {
    closeProfileMenu();
    closeMobileMenu();
    closeNotificationMenu();
    window.location.href = DASHBOARD_URL;
  };

  const handleProfile = () => {
    closeProfileMenu();
    closeMobileMenu();
    window.location.href = `${DASHBOARD_URL}/profile`;
  };

  const handleMyCourses = () => {
    closeProfileMenu();
    closeMobileMenu();
    window.location.href = `${DASHBOARD_URL}/courses`;
  };

  const handleNotifications = () => {
    closeNotificationMenu();
    closeMobileMenu();
    window.location.href = `${DASHBOARD_URL}/notifications`;
  };

  const handleLearningApp = () => {
    closeMobileMenu();
    window.location.href = COURSE_URL;
  };

  const handleAdminApp = () => {
    closeMobileMenu();
    window.location.href = ADMIN_URL;
  };

  const handleDsaApp = () => {
    closeMoreMenu();
    closeMobileMenu();
    window.location.href = DSA_URL;
  };

  const handlePricing = () => {
    closeMoreMenu();
    closeMobileMenu();
    navigate("/pricing");
  };

  /* ==========================================================
     SUPPORT
  ========================================================== */

  const handleSupport = () => {
    closeProfileMenu();
    closeMobileMenu();
    navigate("/contact");
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    closeProfileMenu();
    closeNotificationMenu();
    closeMobileMenu();

    window.dispatchEvent(new Event("apnaacademy-auth-change"));

    navigate("/login", { replace: true });
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch = () => {
    closeMobileMenu();
    navigate("/courses");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          zIndex: 1200,
        }}
      >
        <Toolbar
          disableGutters
          className="mx-auto flex min-h-[68px] w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex shrink-0 items-center gap-2.5 no-underline"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
              <School fontSize="small" />
            </div>

            <div className="min-w-0">
              <Typography
                component="div"
                className="truncate"
                sx={{
                  color: "#0f172a",
                  fontWeight: 900,
                  fontSize: { xs: "0.98rem", sm: "1.08rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Apna Academy
              </Typography>
              <Typography
                component="div"
                sx={{
                  display: { xs: "none", sm: "block" },
                  color: "#64748b",
                  fontSize: "0.67rem",
                  lineHeight: 1.2,
                  fontWeight: 600,
                }}
              >
                Learn. Build. Grow.
              </Typography>
            </div>
          </Link>

          <nav className="ml-8 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-semibold no-underline transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Button
              onClick={(event) => setMoreAnchor(event.currentTarget)}
              endIcon={<KeyboardArrowDown fontSize="small" />}
              sx={{
                minHeight: 40,
                px: 1.5,
                borderRadius: "9px",
                color: moreOpen ? "#1d4ed8" : "#475569",
                backgroundColor: moreOpen ? "#eff6ff" : "transparent",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 700,
                "&:hover": { color: "#1d4ed8", backgroundColor: "#eff6ff" },
              }}
            >
              More
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Tooltip title="Search courses">
              <IconButton
                onClick={handleSearch}
                aria-label="Search courses"
                sx={{
                  width: 40,
                  height: 40,
                  color: "#475569",
                  backgroundColor: "#ffffff",
                  "&:hover": { color: "#1d4ed8", backgroundColor: "#eff6ff" },
                }}
              >
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton
                onClick={() => setIsDarkMode((previous) => !previous)}
                aria-label="Toggle theme"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  width: 40,
                  height: 40,
                  color: "#475569",
                  backgroundColor: "#ffffff",
                  "&:hover": { color: "#1d4ed8", backgroundColor: "#eff6ff" },
                }}
              >
                {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Tooltip>

            {isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                  onClick={(event) => setNotificationAnchor(event.currentTarget)}
                  aria-label="Notifications"
                  sx={{
                    width: 40,
                    height: 40,
                    color: "#475569",
                    backgroundColor: "#ffffff",
                    "&:hover": { color: "#1d4ed8", backgroundColor: "#eff6ff" },
                  }}
                >
                  <Notifications fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {!isLoggedIn ? (
              <div className="ml-1 hidden items-center gap-2 md:flex">
                <Button
                  onClick={handleLogin}
                  variant="text"
                  startIcon={<Login fontSize="small" />}
                  sx={{ minHeight: 40, px: 1.5, borderRadius: "9px", color: "#334155", fontWeight: 700, textTransform: "none", "&:hover": { color: "#1d4ed8", backgroundColor: "#eff6ff" } }}
                >
                  Login
                </Button>
                <Button
                  onClick={handleRegister}
                  variant="contained"
                  sx={{ minHeight: 40, px: 2, borderRadius: "9px", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, textTransform: "none", boxShadow: "none", "&:hover": { backgroundColor: "#1d4ed8", boxShadow: "none" } }}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="ml-1 hidden md:block">
                <Button
                  onClick={(event) => setProfileAnchor(event.currentTarget)}
                  endIcon={<KeyboardArrowDown sx={{ color: "#64748b" }} />}
                  sx={{ minHeight: 42, px: 1, borderRadius: "10px", color: "#0f172a", backgroundColor: "#ffffff", textTransform: "none", "&:hover": { color: "#0f172a", backgroundColor: "#f8fafc" } }}
                >
                  <Avatar sx={{ width: 32, height: 32, mr: 1, backgroundColor: "#dbeafe", color: "#1d4ed8", fontSize: "0.8rem", fontWeight: 800 }}>
                    {getInitials(user)}
                  </Avatar>
                  <span className="max-w-[110px] truncate text-sm font-bold">
                    {user?.name || user?.fullName || user?.username || "Student"}
                  </span>
                </Button>
              </div>
            )}

            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              sx={{ display: { xs: "inline-flex", lg: "none" }, width: 40, height: 40, color: "#334155" }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* ======================================================
          MENUS
      ======================================================= */}

      <Menu
        anchorEl={profileAnchor}
        open={profileOpen}
        onClose={closeProfileMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleDashboard}>
          <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={handleProfile}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleMyCourses}>
          <ListItemIcon><MenuBook fontSize="small" /></ListItemIcon>
          My Courses
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={moreAnchor}
        open={moreOpen}
        onClose={closeMoreMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={handlePricing}>
          <ListItemIcon><MenuBook fontSize="small" /></ListItemIcon>
          Pricing
        </MenuItem>
        <MenuItem onClick={handleDsaApp}>
          <ListItemIcon><School fontSize="small" /></ListItemIcon>
          DSA Practice
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        open={notificationOpen}
        onClose={closeNotificationMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleNotifications}>
          <ListItemIcon><Notifications fontSize="small" /></ListItemIcon>
          View Notifications
        </MenuItem>
      </Menu>

      <Drawer anchor="right" open={mobileOpen} onClose={closeMobileMenu}>
        <Box sx={{ width: { xs: "min(88vw, 360px)", sm: 360 }, p: 2 }} role="presentation">
          <div className="mb-2 flex items-center justify-between">
            <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>ApnaAcademy</Typography>
            <IconButton onClick={closeMobileMenu} aria-label="Close navigation menu"><Close /></IconButton>
          </div>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItemButton key={item.path} component={NavLink} to={item.path} onClick={closeMobileMenu}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            <ListItemButton onClick={handleLearningApp}>
              <ListItemIcon><MenuBook fontSize="small" /></ListItemIcon>
              <ListItemText primary="Learning App" />
            </ListItemButton>
            <ListItemButton onClick={handlePricing}>
              <ListItemIcon><MenuBook fontSize="small" /></ListItemIcon>
              <ListItemText primary="Pricing" />
            </ListItemButton>
            <ListItemButton onClick={handleDsaApp}>
              <ListItemIcon><School fontSize="small" /></ListItemIcon>
              <ListItemText primary="DSA Practice" />
            </ListItemButton>
            <ListItemButton onClick={handleSupport}>
              <ListItemIcon><SupportAgent fontSize="small" /></ListItemIcon>
              <ListItemText primary="Support" />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {!isLoggedIn ? (
              <>
                <ListItemButton
                  onClick={handleLogin}
                  sx={{
                    borderRadius: 2,
                    mb: 0.75,
                    color: "#334155",
                    "&:hover": { backgroundColor: "#eff6ff", color: "#1d4ed8" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                    <Login fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Login"
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={handleRegister}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    "&:hover": { backgroundColor: "#1d4ed8" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sign Up"
                    primaryTypographyProps={{ fontWeight: 800 }}
                  />
                </ListItemButton>
              </>
            ) : (
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  color: "#dc2626",
                  "&:hover": {
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontWeight: 800 }}
                />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <main className="min-h-[calc(100vh-68px)] bg-white">
        <Outlet />
      </main>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1.15fr_1fr]">
            {/* BRAND */}
            <div className="max-w-md">
              <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <School fontSize="small" />
                </div>
                <Typography sx={{ color: "#0f172a", fontWeight: 900, fontSize: "1.1rem" }}>
                  ApnaAcademy
                </Typography>
              </Link>

              <Typography sx={{ mt: 2, maxWidth: 430, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.7 }}>
                Build practical skills through structured courses, hands-on learning and outcome-focused education.
              </Typography>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Practical Learning</span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Career Focused</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={handleCourses} variant="contained" size="small" startIcon={<MenuBook fontSize="small" />} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, boxShadow: "none" }}>
                  Explore Courses
                </Button>
                <Button onClick={isLoggedIn ? handleDashboard : handleRegister} variant="outlined" size="small" startIcon={<Dashboard fontSize="small" />} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}>
                  {isLoggedIn ? "Open Dashboard" : "Get Started"}
                </Button>
              </div>
            </div>

            {/* QUICK LINKS */}
            <FooterColumn title="Quick Links">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/courses">All Courses</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/login">Login</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
            </FooterColumn>

            {/* LEARNING */}
            <FooterColumn title="Learning">
              <button type="button" onClick={handleLearningApp} className="block w-fit rounded-md border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition-colors duration-200 hover:text-blue-700">Learning App</button>
              {isLoggedIn && (
                <>
                  <button type="button" onClick={handleMyCourses} className="block w-fit rounded-md border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition-colors duration-200 hover:text-blue-700">My Courses</button>
                  <button type="button" onClick={handleNotifications} className="block w-fit rounded-md border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition-colors duration-200 hover:text-blue-700">Notifications</button>
                </>
              )}
              <FooterLink to="/contact">Learning Support</FooterLink>
            </FooterColumn>

            {/* APPS */}
            <FooterColumn title="ApnaAcademy Apps">
              <button type="button" onClick={handleDashboard} className="group flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm"><Dashboard fontSize="small" /></span>
                <span><span className="block text-sm font-bold text-slate-800">Student Dashboard</span><span className="block text-[11px] text-slate-500">Profile & progress</span></span>
              </button>

              <button type="button" onClick={handleLearningApp} className="group mt-2 flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm"><MenuBook fontSize="small" /></span>
                <span><span className="block text-sm font-bold text-slate-800">Learning App</span><span className="block text-[11px] text-slate-500">Courses & lessons</span></span>
              </button>

              <button type="button" onClick={handleDsaApp} className="group mt-2 flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700 shadow-sm"><School fontSize="small" /></span>
                <span><span className="block text-sm font-bold text-slate-800">DSA Practice</span><span className="block text-[11px] text-slate-500">Practice & challenges</span></span>
              </button>

              <button type="button" onClick={handleAdminApp} className="group mt-2 flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm"><Settings fontSize="small" /></span>
                <span><span className="block text-sm font-bold text-slate-800">Admin Portal</span><span className="block text-[11px] text-slate-500">Administration</span></span>
              </button>
            </FooterColumn>

            {/* ACCOUNT / SUPPORT */}
            <FooterColumn title="Account & Support">
              {isLoggedIn ? (
                <>
                  <button type="button" onClick={handleDashboard} className="block w-fit rounded-md border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition-colors duration-200 hover:text-blue-700">Dashboard</button>
                  <button type="button" onClick={handleProfile} className="block w-fit rounded-md border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition-colors duration-200 hover:text-blue-700">Profile</button>
                  <button type="button" onClick={handleLogout} className="block w-fit rounded-md border-0 bg-transparent py-1 text-left text-sm text-red-600 transition-colors duration-200 hover:text-red-700">Logout</button>
                </>
              ) : (
                <>
                  <FooterLink to="/login">Sign In</FooterLink>
                  <FooterLink to="/register">Start Learning</FooterLink>
                </>
              )}
              <FooterLink to="/contact">Help Center</FooterLink>
              <FooterLink to="/contact">Contact Support</FooterLink>
            </FooterColumn>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
              © {new Date().getFullYear()} ApnaAcademy. All rights reserved.
            </Typography>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/about" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 no-underline transition-colors hover:text-blue-700"><InfoOutlined sx={{ fontSize: 15 }} />About</Link>
              <Link to="/contact" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 no-underline transition-colors hover:text-blue-700"><ContactSupport sx={{ fontSize: 15 }} />Support</Link>
              <Link to="/contact" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 no-underline transition-colors hover:text-blue-700"><Settings sx={{ fontSize: 15 }} />Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
