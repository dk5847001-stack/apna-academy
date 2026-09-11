import { useEffect, useState } from "react";

import {
  Link,
  NavLink,
  Outlet,
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
  Notifications,
  KeyboardArrowDown,
  School,
  Login,
  Logout,
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Search,
  Settings,
  Person,
  Close,
} from "@mui/icons-material";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ||
  "http://localhost:5175";

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

export default function MainLayout() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileAnchorEl, setProfileAnchorEl] =
    useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  const profileOpen = Boolean(profileAnchorEl);

  /* =====================================================
     THEME
  ====================================================== */

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

  /* =====================================================
     AUTH STATE
  ====================================================== */

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(Boolean(token));

      try {
        const storedUser =
          localStorage.getItem("user");

        setUser(
          storedUser
            ? JSON.parse(storedUser)
            : null
        );
      } catch {
        setUser(null);
      }
    };

    window.addEventListener(
      "storage",
      checkAuth
    );

    return () => {
      window.removeEventListener(
        "storage",
        checkAuth
      );
    };
  }, []);

  /* =====================================================
     LOGOUT
  ====================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);

    setProfileAnchorEl(null);
    setMobileMenuOpen(false);

    navigate("/login");
  };

  /* =====================================================
     MOBILE MENU
  ====================================================== */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* =====================================================
     PROFILE MENU
  ====================================================== */

  const openProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  /* =====================================================
     USER INITIAL
  ====================================================== */

  const userInitial = (
    user?.name ||
    user?.email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  /* =====================================================
     NAVIGATION LINK
  ====================================================== */

  const navLinkClass = ({ isActive }) =>
    [
      "rounded-xl px-3 py-2 text-sm font-semibold",
      "transition-all duration-200",

      isActive
        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
    ].join(" ");

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <AppBar
        position="sticky"
        elevation={0}
        className="!border-b !border-slate-200/80 !bg-white/90 !text-slate-900 backdrop-blur-xl dark:!border-white/10 dark:!bg-slate-950/90 dark:!text-white"
      >
        <Toolbar
          disableGutters
          className="mx-auto flex !min-h-[72px] w-full max-w-7xl justify-between px-4 sm:px-6 lg:px-8"
        >

          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex shrink-0 items-center gap-3 no-underline"
          >
            <Box className="relative flex !h-10 !w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition duration-300 group-hover:scale-105">
              <School fontSize="small" />

              <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
            </Box>

            <Box className="hidden sm:block">
              <Typography
                component="p"
                className="!text-base !font-black !tracking-tight !text-slate-950 dark:!text-white"
              >
                ApnaAcademy
              </Typography>

              <Typography
                component="p"
                className="!text-[10px] !font-semibold !tracking-wide !text-slate-500"
              >
                LEARN • BUILD • GROW
              </Typography>
            </Box>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <Box className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </Box>

          {/* =================================================
              DESKTOP ACTIONS
          ================================================== */}

          <Box className="hidden items-center gap-1 md:flex">

            {/* Search */}

            <Tooltip title="Search">
              <IconButton
                aria-label="Search"
                className="!h-10 !w-10 !rounded-xl !text-slate-500 hover:!bg-slate-100 hover:!text-slate-950 dark:!text-slate-400 dark:hover:!bg-white/5 dark:hover:!text-white"
              >
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Notifications */}

            {isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                  aria-label="Notifications"
                  onClick={() =>
                    navigate("/notifications")
                  }
                  className="relative !h-10 !w-10 !rounded-xl !text-slate-500 hover:!bg-slate-100 hover:!text-slate-950 dark:!text-slate-400 dark:hover:!bg-white/5 dark:hover:!text-white"
                >
                  <Notifications fontSize="small" />

                  <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950" />
                </IconButton>
              </Tooltip>
            )}

            {/* Theme */}

            <Tooltip
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <IconButton
                aria-label="Theme"
                onClick={() =>
                  setDarkMode(
                    (previous) => !previous
                  )
                }
                className="!h-10 !w-10 !rounded-xl !text-slate-500 hover:!bg-slate-100 hover:!text-slate-950 dark:!text-slate-400 dark:hover:!bg-white/5 dark:hover:!text-white"
              >
                {darkMode ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* =================================================
                GUEST ACTIONS
            ================================================== */}

            {!isLoggedIn ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  startIcon={
                    <Login fontSize="small" />
                  }
                  className="!ml-1 !rounded-xl !px-4 !py-2.5 !text-sm !font-bold !normal-case !text-slate-700 hover:!bg-slate-100 dark:!text-slate-200 dark:hover:!bg-white/5"
                >
                  Login
                </Button>

                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  className="!rounded-xl !bg-slate-950 !px-5 !py-2.5 !text-sm !font-bold !normal-case !shadow-lg !shadow-slate-950/10 hover:!bg-blue-600 dark:!bg-white dark:!text-slate-950 dark:hover:!bg-blue-500 dark:hover:!text-white"
                >
                  Get Started
                </Button>
              </>
            ) : (

              /* =================================================
                 LOGGED-IN PROFILE
              ================================================== */

              <>
                <Button
                  onClick={openProfileMenu}
                  endIcon={
                    <KeyboardArrowDown fontSize="small" />
                  }
                  className="!ml-1 !rounded-xl !border !border-slate-200 !bg-white !px-2 !py-1.5 !normal-case hover:!border-slate-300 hover:!shadow-sm dark:!border-white/10 dark:!bg-white/5 dark:hover:!border-white/20"
                >
                  <Avatar className="!h-8 !w-8 !bg-gradient-to-br !from-blue-500 !to-indigo-600 !text-xs !font-black !text-white">
                    {userInitial}
                  </Avatar>

                  <Box className="ml-2 hidden max-w-[100px] text-left xl:block">
                    <Typography
                      component="p"
                      className="truncate !text-xs !font-bold !text-slate-900 dark:!text-white"
                    >
                      {user?.name || "Student"}
                    </Typography>

                    <Typography
                      component="p"
                      className="truncate !text-[10px] !text-slate-500"
                    >
                      Student
                    </Typography>
                  </Box>
                </Button>

                {/* Profile Dropdown */}

                <Menu
                  anchorEl={profileAnchorEl}
                  open={profileOpen}
                  onClose={closeProfileMenu}
                  elevation={10}
                  slotProps={{
                    paper: {
                      className:
                        "!mt-2 !w-60 !rounded-2xl !border !border-slate-200 !bg-white !shadow-2xl dark:!border-white/10 dark:!bg-slate-900",
                    },
                  }}
                >
                  <Box className="px-4 py-3">
                    <Typography
                      className="truncate !text-sm !font-bold !text-slate-900 dark:!text-white"
                    >
                      {user?.name || "Student"}
                    </Typography>

                    <Typography
                      className="mt-0.5 truncate !text-xs !text-slate-500"
                    >
                      {user?.email || ""}
                    </Typography>
                  </Box>

                  <Divider className="!border-slate-100 dark:!border-white/5" />

                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={closeProfileMenu}
                    className="!mx-2 !mt-1 !rounded-xl !text-sm !font-semibold"
                  >
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>

                    Profile
                  </MenuItem>

                  <MenuItem
                    component="a"
                    href={DASHBOARD_URL}
                    onClick={closeProfileMenu}
                    className="!mx-2 !rounded-xl !text-sm !font-semibold"
                  >
                    <ListItemIcon>
                      <School fontSize="small" />
                    </ListItemIcon>

                    Dashboard
                  </MenuItem>

                  <MenuItem
                    component={Link}
                    to="/settings"
                    onClick={closeProfileMenu}
                    className="!mx-2 !rounded-xl !text-sm !font-semibold"
                  >
                    <ListItemIcon>
                      <Settings fontSize="small" />
                    </ListItemIcon>

                    Settings
                  </MenuItem>

                  <Divider className="!my-1 !border-slate-100 dark:!border-white/5" />

                  <MenuItem
                    onClick={handleLogout}
                    className="!mx-2 !rounded-xl !text-sm !font-semibold !text-red-600"
                  >
                    <ListItemIcon>
                      <Logout
                        fontSize="small"
                        className="!text-red-600"
                      />
                    </ListItemIcon>

                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* =================================================
              MOBILE ACTIONS
          ================================================== */}

          <Box className="flex items-center gap-1 md:hidden">

            <Tooltip title="Theme">
              <IconButton
                onClick={() =>
                  setDarkMode(
                    (previous) => !previous
                  )
                }
                className="!h-10 !w-10 !rounded-xl !text-slate-500 hover:!bg-slate-100 dark:!text-slate-400 dark:hover:!bg-white/5"
              >
                {darkMode ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <IconButton
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
              className="!h-10 !w-10 !rounded-xl !text-slate-700 hover:!bg-slate-100 dark:!text-slate-300 dark:hover:!bg-white/5"
            >
              {mobileMenuOpen ? (
                <Close fontSize="small" />
              ) : (
                <MenuIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Toolbar>

        {/* ===================================================
            MOBILE DRAWER
        ==================================================== */}

        <Drawer
          anchor="top"
          open={mobileMenuOpen}
          onClose={closeMobileMenu}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            className:
              "!top-[72px] !border-t !border-slate-200 !bg-white dark:!border-white/10 dark:!bg-slate-950",
          }}
        >
          <Box className="px-4 py-4 md:hidden">

            <List disablePadding>
              {navItems.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className="!mb-1 !rounded-xl"
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      className:
                        "!text-sm !font-semibold",
                    }}
                  />
                </ListItemButton>
              ))}

              {isLoggedIn && (
                <>
                  <ListItemButton
                    component="a"
                    href={DASHBOARD_URL}
                    onClick={closeMobileMenu}
                    className="!mb-1 !rounded-xl"
                  >
                    <ListItemIcon>
                      <School fontSize="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary="Dashboard"
                      primaryTypographyProps={{
                        className:
                          "!text-sm !font-semibold",
                      }}
                    />
                  </ListItemButton>

                  <ListItemButton
                    component={Link}
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="!mb-1 !rounded-xl"
                  >
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary="Profile"
                      primaryTypographyProps={{
                        className:
                          "!text-sm !font-semibold",
                      }}
                    />
                  </ListItemButton>

                  <ListItemButton
                    component={Link}
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className="!mb-1 !rounded-xl"
                  >
                    <ListItemIcon>
                      <Notifications fontSize="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary="Notifications"
                      primaryTypographyProps={{
                        className:
                          "!text-sm !font-semibold",
                      }}
                    />
                  </ListItemButton>
                </>
              )}
            </List>

            <Divider className="!my-4 !border-slate-200 dark:!border-white/10" />

            {!isLoggedIn ? (
              <Box className="grid grid-cols-2 gap-2">

                <Button
                  component={Link}
                  to="/login"
                  onClick={closeMobileMenu}
                  variant="outlined"
                  className="!rounded-xl !border-slate-200 !py-3 !text-sm !font-bold !normal-case dark:!border-white/10 dark:!text-white"
                >
                  Login
                </Button>

                <Button
                  component={Link}
                  to="/register"
                  onClick={closeMobileMenu}
                  variant="contained"
                  className="!rounded-xl !bg-slate-950 !py-3 !text-sm !font-bold !normal-case dark:!bg-white dark:!text-slate-950"
                >
                  Get Started
                </Button>

              </Box>
            ) : (
              <Button
                fullWidth
                startIcon={
                  <Logout fontSize="small" />
                }
                onClick={handleLogout}
                className="!rounded-xl !bg-red-50 !py-3 !text-sm !font-bold !normal-case !text-red-600 dark:!bg-red-500/10 dark:!text-red-400"
              >
                Logout
              </Button>
            )}
          </Box>
        </Drawer>
      </AppBar>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <main className="min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Box
        component="footer"
        className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900"
      >
        <Box className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <Box className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            {/* Brand */}

            <Box className="lg:col-span-2">

              <Link
                to="/"
                className="inline-flex items-center gap-3 no-underline"
              >
                <Box className="flex !h-11 !w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                  <School />
                </Box>

                <Box>
                  <Typography
                    component="p"
                    className="!font-black !text-slate-950 dark:!text-white"
                  >
                    ApnaAcademy
                  </Typography>

                  <Typography
                    component="p"
                    className="!text-[10px] !font-semibold !tracking-wide !text-slate-500"
                  >
                    LEARN • BUILD • GROW
                  </Typography>
                </Box>
              </Link>

              <Typography
                component="p"
                className="!mt-5 !max-w-md !text-sm !leading-7 !text-slate-500 dark:!text-slate-400"
              >
                Build practical skills through
                structured learning, real-world
                projects and an outcome-focused
                learning experience.
              </Typography>

              <Box className="mt-6 flex flex-wrap gap-2">

                {[
                  "LinkedIn",
                  "GitHub",
                  "Instagram",
                ].map((social) => (
                  <Button
                    key={social}
                    variant="outlined"
                    size="small"
                    className="!rounded-xl !border-slate-200 !bg-white !px-3 !py-2 !text-xs !font-bold !normal-case !text-slate-500 hover:!border-blue-200 hover:!text-blue-600 dark:!border-white/10 dark:!bg-white/5 dark:!text-slate-400"
                  >
                    {social}
                  </Button>
                ))}

              </Box>
            </Box>

            {/* Platform */}

            <FooterColumn title="Platform">
              <FooterLink to="/">
                Home
              </FooterLink>

              <FooterLink to="/courses">
                Courses
              </FooterLink>

              <FooterExternalLink
                href={DASHBOARD_URL}
              >
                Dashboard
              </FooterExternalLink>
            </FooterColumn>

            {/* Company */}

            <FooterColumn title="Company">
              <FooterLink to="/about">
                About Us
              </FooterLink>

              <FooterLink to="/contact">
                Contact
              </FooterLink>

              <FooterLink to="/support">
                Support
              </FooterLink>
            </FooterColumn>

            {/* Legal */}

            <FooterColumn title="Legal">
              <FooterLink to="/privacy">
                Privacy Policy
              </FooterLink>

              <FooterLink to="/terms">
                Terms & Conditions
              </FooterLink>

              <FooterLink to="/refund">
                Refund Policy
              </FooterLink>
            </FooterColumn>
          </Box>

          {/* Bottom */}

          <Box className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">

            <Typography
              component="p"
              className="!text-xs !text-slate-500"
            >
              © {new Date().getFullYear()}{" "}
              ApnaAcademy. All rights reserved.
            </Typography>

            <Typography
              component="p"
              className="!text-xs !font-medium !text-slate-500"
            >
              Designed for modern learners.
            </Typography>

          </Box>
        </Box>
      </Box>
    </div>
  );
}

/* =========================================================
   FOOTER COMPONENTS
========================================================= */

function FooterColumn({
  title,
  children,
}) {
  return (
    <Box>
      <Typography
        component="h3"
        className="!text-sm !font-black !text-slate-900 dark:!text-white"
      >
        {title}
      </Typography>

      <Box className="mt-5 space-y-3">
        {children}
      </Box>
    </Box>
  );
}

function FooterLink({
  to,
  children,
}) {
  return (
    <Link
      to={to}
      className="block text-sm text-slate-500 no-underline transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
    >
      {children}
    </Link>
  );
}

function FooterExternalLink({
  href,
  children,
}) {
  return (
    <a
      href={href}
      className="block text-sm text-slate-500 no-underline transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
    >
      {children}
    </a>
  );
}