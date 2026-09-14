import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert, IconButton } from "@mui/material";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SystemUpdateAltRoundedIcon from "@mui/icons-material/SystemUpdateAltRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import notificationService from "../services/notification.service";

const DISMISSED_STORAGE_KEY = "apnaacademy_dashboard_notification_dismissed";
const REFRESH_INTERVAL_MS = 20000;
const MAX_VISIBLE_NOTIFICATIONS = 3;

const getNotificationId = (notification) =>
  String(
    notification?._id ||
      notification?.id ||
      `${notification?.createdAt || ""}:${notification?.title || ""}`,
  );

const readDismissedIds = () => {
  try {
    const stored = localStorage.getItem(DISMISSED_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
};

const saveDismissedIds = (ids) => {
  try {
    localStorage.setItem(
      DISMISSED_STORAGE_KEY,
      JSON.stringify(Array.from(new Set(ids)).slice(-100)),
    );
  } catch {
    // Ignore storage failures; dismissal still works for the current render.
  }
};

const NOTIFICATION_STYLES = {
  announcement: {
    label: "Important",
    caption: "Announcement",
    icon: CampaignRoundedIcon,
    color: "#d97706",
    border: "#fcd34d",
    background:
      "linear-gradient(135deg, rgba(255,251,235,0.98) 0%, rgba(254,243,199,0.92) 100%)",
    text: "#78350f",
    hover: "rgba(120, 53, 15, 0.10)",
  },
  course: {
    label: "Course Update",
    caption: "Learning",
    icon: SchoolRoundedIcon,
    color: "#2563eb",
    border: "#bfdbfe",
    background:
      "linear-gradient(135deg, rgba(239,246,255,0.98) 0%, rgba(219,234,254,0.92) 100%)",
    text: "#1e3a8a",
    hover: "rgba(30, 64, 175, 0.10)",
  },
  "course-update": {
    label: "Course Update",
    caption: "Learning",
    icon: SystemUpdateAltRoundedIcon,
    color: "#2563eb",
    border: "#bfdbfe",
    background:
      "linear-gradient(135deg, rgba(239,246,255,0.98) 0%, rgba(219,234,254,0.92) 100%)",
    text: "#1e3a8a",
    hover: "rgba(30, 64, 175, 0.10)",
  },
  certificate: {
    label: "Achievement",
    caption: "Certificate",
    icon: EmojiEventsRoundedIcon,
    color: "#7c3aed",
    border: "#ddd6fe",
    background:
      "linear-gradient(135deg, rgba(245,243,255,0.98) 0%, rgba(237,233,254,0.94) 100%)",
    text: "#4c1d95",
    hover: "rgba(76, 29, 149, 0.10)",
  },
  "module-unlocked": {
    label: "Unlocked",
    caption: "New Module",
    icon: CheckCircleRoundedIcon,
    color: "#059669",
    border: "#a7f3d0",
    background:
      "linear-gradient(135deg, rgba(236,253,245,0.98) 0%, rgba(209,250,229,0.94) 100%)",
    text: "#064e3b",
    hover: "rgba(6, 78, 59, 0.10)",
  },
  purchase: {
    label: "Payment",
    caption: "Purchase",
    icon: PaymentRoundedIcon,
    color: "#059669",
    border: "#a7f3d0",
    background:
      "linear-gradient(135deg, rgba(236,253,245,0.98) 0%, rgba(209,250,229,0.94) 100%)",
    text: "#064e3b",
    hover: "rgba(6, 78, 59, 0.10)",
  },
  promotion: {
    label: "Special",
    caption: "Promotion",
    icon: LocalOfferRoundedIcon,
    color: "#db2777",
    border: "#fbcfe8",
    background:
      "linear-gradient(135deg, rgba(253,242,248,0.98) 0%, rgba(252,231,243,0.94) 100%)",
    text: "#831843",
    hover: "rgba(131, 24, 67, 0.10)",
  },
  system: {
    label: "System",
    caption: "System Notice",
    icon: InfoOutlinedIcon,
    color: "#475569",
    border: "#cbd5e1",
    background:
      "linear-gradient(135deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.94) 100%)",
    text: "#334155",
    hover: "rgba(51, 65, 85, 0.10)",
  },
};

const getNotificationStyle = (type) =>
  NOTIFICATION_STYLES[String(type || "system").toLowerCase()] || NOTIFICATION_STYLES.system;

export default function DashboardNotificationAlert() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(readDismissedIds);
  const [loading, setLoading] = useState(true);

  const isDashboardHome =
    location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/" ||
    location.pathname === "/";

  const loadNotifications = useCallback(async () => {
    if (!isDashboardHome) return;

    try {
      const data = await notificationService.getNotifications({ limit: 50 });
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (error) {
      console.error("Dashboard notification alert loading failed:", error);
    } finally {
      setLoading(false);
    }
  }, [isDashboardHome]);

  useEffect(() => {
    if (!isDashboardHome) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    const load = async () => {
      try {
        const data = await notificationService.getNotifications({ limit: 50 });
        if (active) {
          setNotifications(
            Array.isArray(data?.notifications) ? data.notifications : [],
          );
        }
      } catch (error) {
        if (active) {
          console.error("Dashboard notification alert loading failed:", error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const intervalId = window.setInterval(loadNotifications, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isDashboardHome, loadNotifications]);

  const visibleNotifications = useMemo(() => {
    if (!isDashboardHome || loading) return [];

    return notifications
      .filter(
        (notification) =>
          !notification?.isRead &&
          !dismissedIds.includes(getNotificationId(notification)),
      )
      .slice(0, MAX_VISIBLE_NOTIFICATIONS);
  }, [dismissedIds, isDashboardHome, loading, notifications]);

  if (!isDashboardHome || visibleNotifications.length === 0) return null;

  const handleDismiss = (notification) => {
    const notificationId = getNotificationId(notification);
    const nextIds = [...dismissedIds, notificationId];
    setDismissedIds(nextIds);
    saveDismissedIds(nextIds);
  };

  const handleOpen = (link) => {
    const target = link?.trim() || "";
    if (!target) return;

    if (/^https?:\/\//i.test(target)) {
      window.location.assign(target);
      return;
    }

    navigate(target.startsWith("/") ? target : `/${target}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-3 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-5">
      {visibleNotifications.map((notification) => {
        const notificationId = getNotificationId(notification);
        const style = getNotificationStyle(notification.type);
        const NotificationIcon = style.icon;
        const link = notification.link?.trim() || "";

        return (
          <Alert
            key={notificationId}
            severity="warning"
            icon={<NotificationIcon fontSize="inherit" />}
            action={
              <IconButton
                aria-label="Hide notification"
                onClick={() => handleDismiss(notification)}
                size="small"
                sx={{
                  color: "inherit",
                  borderRadius: "10px",
                  transition: "all 180ms ease",
                  "&:hover": {
                    backgroundColor: style.hover,
                    transform: "scale(1.05)",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${style.border}`,
              borderRadius: "18px",
              background: style.background,
              color: style.text,
              boxShadow:
                "0 12px 32px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255,255,255,0.78)",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                background: `linear-gradient(180deg, ${style.color}, ${style.color}cc)`,
              },
              "& .MuiAlert-icon": {
                color: style.color,
                alignItems: "center",
                fontSize: "25px",
                ml: "4px",
              },
              "& .MuiAlert-message": {
                width: "100%",
                minWidth: 0,
                py: "2px",
              },
              "& .MuiAlert-action": {
                alignItems: "center",
                pt: 0,
                mr: "2px",
              },
            }}
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex rounded-full border bg-white/70 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] shadow-sm"
                    style={{ borderColor: style.border, color: style.color }}
                  >
                    {style.label}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: style.color }}
                  >
                    {style.caption}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    New
                  </span>
                </div>
                <p className="mt-1 break-words text-sm font-extrabold text-slate-900 sm:text-[15px]">
                  {notification.title || "ApnaAcademy Update"}
                </p>
                <p className="mt-0.5 break-words text-xs leading-5 text-slate-600 sm:text-sm">
                  {notification.message || "You have a new notification."}
                </p>
              </div>

              {link ? (
                <button
                  type="button"
                  onClick={() => handleOpen(link)}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl px-4 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:self-center"
                  style={{ backgroundColor: style.color }}
                >
                  Show
                  <OpenInNewIcon sx={{ fontSize: 15 }} />
                </button>
              ) : null}
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
