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
  Dashboard,
  MenuBook,
  SupportAgent,
  InfoOutlined,
  ContactSupport,
} from "@mui/icons-material";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5175";

const COURSE_URL =
  import.meta.env.VITE_COURSE_URL || "http://localhost:5174";

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
      className="
        block
        w-fit
        rounded-md
        py-1
        text-sm
        text-slate-600
        no-underline
        transition-colors
        duration-200
        hover:text-blue-700
      "
    >
      {children}
    </Link>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const [user, setUser] = useState(getStoredUser);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const isLoggedIn = Boolean(
    localStorage.getItem("token") && user
  );

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
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileAnchor(null);
    setMobileOpen(false);

    navigate("/login");
  };

  const handleDashboard = () => {
    setProfileAnchor(null);
    setMobileOpen(false);

    window.location.href = DASHBOARD_URL;
  };

  const handleCourses = () => {
    setMobileOpen(false);
    navigate("/courses");
  };

  const handleLogin = () => {
    setMobileOpen(false);
    navigate("/login");
  };

  const handleRegister = () => {
    setMobileOpen(false);
    navigate("/register");
  };

  const handleProfile = () => {
    setProfileAnchor(null);
    setMobileOpen(false);

    window.location.href = `${DASHBOARD_URL}/profile`;
  };

  const handleMyCourses = () => {
    setProfileAnchor(null);
    setMobileOpen(false);

    window.location.href = `${DASHBOARD_URL}/courses`;
  };

  const handleNotifications = () => {
    setNotificationAnchor(null);
    setMobileOpen(false);

    window.location.href = `${DASHBOARD_URL}/notifications`;
  };

  const handleSupport = () => {
    setMobileOpen(false);
    navigate("/contact");
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const profileOpen = Boolean(profileAnchor);
  const notificationOpen = Boolean(notificationAnchor);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}

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
          className="
            mx-auto
            flex
            min-h-[68px]
            w-full
            max-w-7xl
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* =====================================================
              LOGO
          ===================================================== */}

          <Link
            to="/"
            onClick={handleNavClick}
            className="
              flex
              shrink-0
              items-center
              gap-2.5
              no-underline
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-blue-100
                bg-blue-50
                text-blue-700
              "
            >
              <School fontSize="small" />
            </div>

            <div className="hidden sm:block">
              <Typography
                component="div"
                sx={{
                  color: "#0f172a",
                  fontWeight: 900,
                  fontSize: "1.08rem",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                ApnaAcademy
              </Typography>

              <Typography
                component="div"
                sx={{
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

          {/* =====================================================
              DESKTOP NAVIGATION
          ===================================================== */}

          <nav
            className="
              ml-8
              hidden
              items-center
              gap-1
              lg:flex
            "
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `
                    rounded-lg
                    px-3.5
                    py-2
                    text-sm
                    font-semibold
                    no-underline
                    transition-colors
                    duration-200
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                    }
                  `
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {/* ===================================================
                SEARCH
            =================================================== */}

            <Tooltip title="Search courses">
              <IconButton
                onClick={handleCourses}
                aria-label="Search courses"
                sx={{
                  width: 40,
                  height: 40,
                  color: "#475569",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    color: "#1d4ed8",
                    backgroundColor: "#eff6ff",
                  },
                }}
              >
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* ===================================================
                THEME
            =================================================== */}

            <Tooltip
              title={
                isDarkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <IconButton
                onClick={() => setIsDarkMode((previous) => !previous)}
                aria-label="Toggle theme"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                  width: 40,
                  height: 40,
                  color: "#475569",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    color: "#1d4ed8",
                    backgroundColor: "#eff6ff",
                  },
                }}
              >
                {isDarkMode ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* ===================================================
                NOTIFICATIONS
            =================================================== */}

            {isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                  onClick={(event) =>
                    setNotificationAnchor(event.currentTarget)
                  }
                  aria-label="Notifications"
                  sx={{
                    width: 40,
                    height: 40,
                    color: "#475569",
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      color: "#1d4ed8",
                      backgroundColor: "#eff6ff",
                    },
                  }}
                >
                  <Notifications fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* ===================================================
                DESKTOP AUTH
            =================================================== */}

            {!isLoggedIn ? (
              <div className="ml-1 hidden items-center gap-2 md:flex">
                <Button
                  onClick={handleLogin}
                  variant="text"
                  startIcon={<Login fontSize="small" />}
                  sx={{
                    minHeight: 40,
                    px: 1.5,
                    borderRadius: "9px",
                    color: "#334155",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": {
                      color: "#1d4ed8",
                      backgroundColor: "#eff6ff",
                    },
                  }}
                >
                  Login
                </Button>

                <Button
                  onClick={handleRegister}
                  variant="contained"
                  sx={{
                    minHeight: 40,
                    px: 2,
                    borderRadius: "9px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#1d4ed8",
                      boxShadow: "none",
                    },
                  }}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="ml-1 hidden md:block">
                <Button
                  onClick={(event) =>
                    setProfileAnchor(event.currentTarget)
                  }
                  endIcon={
                    <KeyboardArrowDown
                      sx={{
                        color: "#64748b",
                      }}
                    />
                  }
                  sx={{
                    minHeight: 42,
                    px: 1,
                    borderRadius: "10px",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    textTransform: "none",
                    "&:hover": {
                      color: "#0f172a",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      backgroundColor: "#dbeafe",
                      color: "#1d4ed8",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                    }}
                  >
                    {getInitials(user)}
                  </Avatar>

                  <span className="max-w-[110px] truncate text-sm font-bold">
                    {user?.name ||
                      user?.fullName ||
                      user?.username ||
                      "Student"}
                  </span>
                </Button>
              </div>
            )}

            {/* ===================================================
                MOBILE MENU
            =================================================== */}

            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              sx={{
                ml: 0.5,
                display: {
                  xs: "inline-flex",
                  md: "none",
                },
                width: 42,
                height: 42,
                color: "#0f172a",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  color: "#1d4ed8",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* =========================================================
          PROFILE MENU
      ========================================================= */}

      <Menu
        anchorEl={profileAnchor}
        open={profileOpen}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 250,
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 14px 35px rgba(15, 23, 42, 0.12)",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Profile Header */}

        <Box
          sx={{
            px: 2,
            py: 1.75,
            backgroundColor: "#f8fafc",
          }}
        >
          <div className="flex items-center gap-3">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                fontWeight: 800,
              }}
            >
              {getInitials(user)}
            </Avatar>

            <div className="min-w-0">
              <Typography
                sx={{
                  color: "#0f172a",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                }}
                noWrap
              >
                {user?.name ||
                  user?.fullName ||
                  user?.username ||
                  "Student"}
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "0.72rem",
                }}
                noWrap
              >
                {user?.email || "Student account"}
              </Typography>
            </div>
          </div>
        </Box>

        <Divider />

        <MenuItem
          onClick={handleProfile}
          sx={{
            minHeight: 44,
            color: "#334155",
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <Person fontSize="small" />
          </ListItemIcon>

          Profile
        </MenuItem>

        <MenuItem
          onClick={handleMyCourses}
          sx={{
            minHeight: 44,
            color: "#334155",
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <MenuBook fontSize="small" />
          </ListItemIcon>

          My Courses
        </MenuItem>

        <MenuItem
          onClick={handleDashboard}
          sx={{
            minHeight: 44,
            color: "#334155",
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <Dashboard fontSize="small" />
          </ListItemIcon>

          Dashboard
        </MenuItem>

        <MenuItem
          onClick={handleSupport}
          sx={{
            minHeight: 44,
            color: "#334155",
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <SupportAgent fontSize="small" />
          </ListItemIcon>

          Support
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            minHeight: 44,
            color: "#dc2626",
            fontSize: "0.875rem",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <Logout fontSize="small" />
          </ListItemIcon>

          Logout
        </MenuItem>
      </Menu>

      {/* =========================================================
          NOTIFICATION MENU
      ========================================================= */}

      <Menu
        anchorEl={notificationAnchor}
        open={notificationOpen}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 300,
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 14px 35px rgba(15, 23, 42, 0.12)",
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              color: "#0f172a",
              fontWeight: 800,
              fontSize: "0.9rem",
            }}
          >
            Notifications
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              color: "#64748b",
              fontSize: "0.75rem",
            }}
          >
            Stay updated with your learning activity.
          </Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={handleNotifications}
          sx={{
            minHeight: 52,
            color: "#334155",
            "&:hover": {
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <Notifications fontSize="small" />
          </ListItemIcon>

          View all notifications
        </MenuItem>
      </Menu>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: "88%",
                sm: 360,
              },
              maxWidth: 380,
              backgroundColor: "#ffffff",
              color: "#0f172a",
              borderLeft: "1px solid #e2e8f0",
            },
          },
        }}
      >
        <div className="flex h-full flex-col bg-white">
          {/* Drawer Header */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 no-underline"
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-700
                "
              >
                <School fontSize="small" />
              </div>

              <div>
                <Typography
                  sx={{
                    color: "#0f172a",
                    fontWeight: 900,
                    fontSize: "1rem",
                    lineHeight: 1.1,
                  }}
                >
                  ApnaAcademy
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                  }}
                >
                  Learn. Build. Grow.
                </Typography>
              </div>
            </Link>

            <IconButton
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              sx={{
                width: 40,
                height: 40,
                color: "#475569",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  color: "#1d4ed8",
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </div>

          {/* User Section */}

          {isLoggedIn && (
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8",
                    fontWeight: 800,
                  }}
                >
                  {getInitials(user)}
                </Avatar>

                <div className="min-w-0">
                  <Typography
                    sx={{
                      color: "#0f172a",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                    noWrap
                  >
                    {user?.name ||
                      user?.fullName ||
                      user?.username ||
                      "Student"}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "0.72rem",
                    }}
                    noWrap
                  >
                    {user?.email || "Student account"}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation */}

          <List sx={{ px: 1.5, py: 2 }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={handleNavClick}
                className="no-underline"
              >
                {({ isActive }) => (
                  <ListItemButton
                    sx={{
                      minHeight: 46,
                      mb: 0.5,
                      borderRadius: "9px",
                      color: isActive ? "#1d4ed8" : "#334155",
                      backgroundColor: isActive
                        ? "#eff6ff"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                        color: "#1d4ed8",
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.9rem",
                            fontWeight: isActive ? 800 : 600,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                )}
              </NavLink>
            ))}

            <ListItemButton
              onClick={handleCourses}
              sx={{
                minHeight: 46,
                mb: 0.5,
                borderRadius: "9px",
                color: "#334155",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  color: "#1d4ed8",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: "inherit",
                }}
              >
                <Search fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Search Courses"
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => setIsDarkMode((previous) => !previous)}
              sx={{
                minHeight: 46,
                mb: 0.5,
                borderRadius: "9px",
                color: "#334155",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  color: "#1d4ed8",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: "inherit",
                }}
              >
                {isDarkMode ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  isDarkMode
                    ? "Light Mode"
                    : "Dark Mode"
                }
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </ListItemButton>

            {isLoggedIn && (
              <>
                <Divider sx={{ my: 1.5 }} />

                <ListItemButton
                  onClick={handleDashboard}
                  sx={{
                    minHeight: 46,
                    mb: 0.5,
                    borderRadius: "9px",
                    color: "#334155",
                    "&:hover": {
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: "inherit",
                    }}
                  >
                    <Dashboard fontSize="small" />
                  </ListItemIcon>

                  <ListItemText
                    primary="Dashboard"
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={handleProfile}
                  sx={{
                    minHeight: 46,
                    mb: 0.5,
                    borderRadius: "9px",
                    color: "#334155",
                    "&:hover": {
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: "inherit",
                    }}
                  >
                    <Person fontSize="small" />
                  </ListItemIcon>

                  <ListItemText
                    primary="Profile"
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={handleMyCourses}
                  sx={{
                    minHeight: 46,
                    mb: 0.5,
                    borderRadius: "9px",
                    color: "#334155",
                    "&:hover": {
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: "inherit",
                    }}
                  >
                    <MenuBook fontSize="small" />
                  </ListItemIcon>

                  <ListItemText
                    primary="My Courses"
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={handleNotifications}
                  sx={{
                    minHeight: 46,
                    mb: 0.5,
                    borderRadius: "9px",
                    color: "#334155",
                    "&:hover": {
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: "inherit",
                    }}
                  >
                    <Notifications fontSize="small" />
                  </ListItemIcon>

                  <ListItemText
                    primary="Notifications"
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    minHeight: 46,
                    mb: 0.5,
                    borderRadius: "9px",
                    color: "#dc2626",
                    "&:hover": {
                      backgroundColor: "#fef2f2",
                      color: "#b91c1c",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: "inherit",
                    }}
                  >
                    <Logout fontSize="small" />
                  </ListItemIcon>

                  <ListItemText
                    primary="Logout"
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.9rem",
                          fontWeight: 700,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </>
            )}
          </List>

          {/* Mobile Auth */}

          {!isLoggedIn && (
            <div className="mt-auto border-t border-slate-200 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleLogin}
                  variant="outlined"
                  sx={{
                    minHeight: 44,
                    borderRadius: "9px",
                    borderColor: "#cbd5e1",
                    color: "#334155",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#2563eb",
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  Login
                </Button>

                <Button
                  onClick={handleRegister}
                  variant="contained"
                  sx={{
                    minHeight: 44,
                    borderRadius: "9px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#1d4ed8",
                      boxShadow: "none",
                    },
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="min-h-[calc(100vh-68px)] bg-white">
        <Outlet />
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-slate-200 bg-white">
        <div
          className="
            mx-auto
            w-full
            max-w-7xl
            px-4
            py-12
            sm:px-6
            lg:px-8
          "
        >
          {/* Footer Top */}

          <div
            className="
              grid
              grid-cols-1
              gap-10
              md:grid-cols-2
              lg:grid-cols-[1.5fr_1fr_1fr_1fr]
            "
          >
            {/* Brand */}

            <div className="max-w-md">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 no-underline"
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-700
                  "
                >
                  <School fontSize="small" />
                </div>

                <Typography
                  sx={{
                    color: "#0f172a",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                  }}
                >
                  ApnaAcademy
                </Typography>
              </Link>

              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 430,
                  color: "#64748b",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
              >
                Build practical skills through structured courses,
                hands-on learning and outcome-focused education.
              </Typography>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className="
                    rounded-full
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  Practical Learning
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  Career Focused
                </span>
              </div>
            </div>

            {/* Platform */}

            <FooterColumn title="Platform">
              <FooterLink to="/courses">
                Courses
              </FooterLink>

              <FooterLink to="/about">
                About Us
              </FooterLink>

              <FooterLink to="/contact">
                Contact
              </FooterLink>

              <button
                type="button"
                onClick={() => {
                  window.location.href = COURSE_URL;
                }}
                className="
                  block
                  w-fit
                  rounded-md
                  border-0
                  bg-transparent
                  py-1
                  text-left
                  text-sm
                  text-slate-600
                  transition-colors
                  duration-200
                  hover:text-blue-700
                "
              >
                Learning App
              </button>
            </FooterColumn>

            {/* Support */}

            <FooterColumn title="Support">
              <FooterLink to="/contact">
                Help Center
              </FooterLink>

              <FooterLink to="/contact">
                Contact Support
              </FooterLink>

              <FooterLink to="/privacy">
                Privacy Policy
              </FooterLink>

              <FooterLink to="/terms">
                Terms & Conditions
              </FooterLink>
            </FooterColumn>

            {/* Account */}

            <FooterColumn title="Account">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={handleDashboard}
                    className="
                      block
                      w-fit
                      rounded-md
                      border-0
                      bg-transparent
                      py-1
                      text-left
                      text-sm
                      text-slate-600
                      transition-colors
                      duration-200
                      hover:text-blue-700
                    "
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={handleMyCourses}
                    className="
                      block
                      w-fit
                      rounded-md
                      border-0
                      bg-transparent
                      py-1
                      text-left
                      text-sm
                      text-slate-600
                      transition-colors
                      duration-200
                      hover:text-blue-700
                    "
                  >
                    My Courses
                  </button>

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="
                      block
                      w-fit
                      rounded-md
                      border-0
                      bg-transparent
                      py-1
                      text-left
                      text-sm
                      text-slate-600
                      transition-colors
                      duration-200
                      hover:text-blue-700
                    "
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      block
                      w-fit
                      rounded-md
                      border-0
                      bg-transparent
                      py-1
                      text-left
                      text-sm
                      text-red-600
                      transition-colors
                      duration-200
                      hover:text-red-700
                    "
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <FooterLink to="/login">
                    Login
                  </FooterLink>

                  <FooterLink to="/register">
                    Create Account
                  </FooterLink>
                </>
              )}
            </FooterColumn>
          </div>

          {/* Footer Bottom */}

          <div
            className="
              mt-10
              flex
              flex-col
              gap-3
              border-t
              border-slate-200
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
              }}
            >
              © {new Date().getFullYear()} ApnaAcademy. All
              rights reserved.
            </Typography>

            <div className="flex items-center gap-4">
              <Link
                to="/about"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-slate-500
                  no-underline
                  transition-colors
                  hover:text-blue-700
                "
              >
                <InfoOutlined sx={{ fontSize: 15 }} />
                About
              </Link>

              <Link
                to="/contact"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-slate-500
                  no-underline
                  transition-colors
                  hover:text-blue-700
                "
              >
                <ContactSupport sx={{ fontSize: 15 }} />
                Support
              </Link>

              <Link
                to="/contact"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-slate-500
                  no-underline
                  transition-colors
                  hover:text-blue-700
                "
              >
                <Settings sx={{ fontSize: 15 }} />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}