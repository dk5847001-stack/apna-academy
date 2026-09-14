import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert, IconButton } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import notificationService from "../services/notification.service";

const DISMISSED_STORAGE_KEY = "apnaacademy_dashboard_notification_dismissed";

const getNotificationId = (notification) => String(notification?._id || notification?.id || `${notification?.createdAt || ""}:${notification?.title || ""}`);

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
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids)).slice(-100)));
  } catch {
    // Ignore storage failures; dismissal still works for the current render.
  }
};

export default function DashboardNotificationAlert() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(readDismissedIds);
  const [loading, setLoading] = useState(true);

  const isDashboardHome = location.pathname === "/dashboard" || location.pathname === "/dashboard/" || location.pathname === "/";

  useEffect(() => {
    if (!isDashboardHome) return undefined;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getNotifications({ limit: 50 });
        if (active) setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      } catch (error) {
        console.error("Dashboard notification alert loading failed:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isDashboardHome]);

  const visibleNotification = useMemo(() => {
    if (!isDashboardHome || loading) return null;
    return notifications.find((notification) => !notification?.isRead && !dismissedIds.includes(getNotificationId(notification))) || null;
  }, [dismissedIds, isDashboardHome, loading, notifications]);

  if (!isDashboardHome || !visibleNotification) return null;

  const notificationId = getNotificationId(visibleNotification);
  const link = visibleNotification.link?.trim() || "";

  const handleDismiss = () => {
    const nextIds = [...dismissedIds, notificationId];
    setDismissedIds(nextIds);
    saveDismissedIds(nextIds);
  };

  const handleOpen = () => {
    if (!link) return;
    if (/^https?:\/\//i.test(link)) {
      window.location.assign(link);
      return;
    }
    navigate(link);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-5">
      <Alert
        severity="warning"
        icon={<WarningAmberRoundedIcon fontSize="inherit" />}
        action={
          <IconButton aria-label="Hide notification" onClick={handleDismiss} size="small" sx={{ color: "inherit", borderRadius: "10px", transition: "all 180ms ease", "&:hover": { backgroundColor: "rgba(120, 53, 15, 0.10)", transform: "scale(1.05)" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #fcd34d",
          borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(255,251,235,0.98) 0%, rgba(254,243,199,0.92) 100%)",
          color: "#78350f",
          boxShadow: "0 12px 32px rgba(120, 53, 15, 0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
          "&::before": { content: '""', position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: "linear-gradient(180deg, #f59e0b, #d97706)" },
          "& .MuiAlert-icon": { color: "#d97706", alignItems: "center", fontSize: "25px", ml: "4px" },
          "& .MuiAlert-message": { width: "100%", minWidth: 0, py: "2px" },
          "& .MuiAlert-action": { alignItems: "center", pt: 0, mr: "2px" },
        }}
      >
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-amber-200 bg-white/70 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-700 shadow-sm">Important</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-600">New notification</span>
            </div>
            <p className="mt-1 break-words text-sm font-extrabold text-slate-900 sm:text-[15px]">{visibleNotification.title || "ApnaAcademy Update"}</p>
            <p className="mt-0.5 break-words text-xs leading-5 text-slate-600 sm:text-sm">{visibleNotification.message || "You have a new notification."}</p>
          </div>

          {link ? (
            <button type="button" onClick={handleOpen} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-amber-500 bg-amber-500 px-4 text-xs font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md sm:self-center">
              Show
              <OpenInNewIcon sx={{ fontSize: 15 }} />
            </button>
          ) : null}
        </div>
      </Alert>
    </div>
  );
}
