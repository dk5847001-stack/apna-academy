import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert, IconButton } from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
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
        severity="info"
        icon={<CampaignOutlinedIcon fontSize="inherit" />}
        action={
          <IconButton aria-label="Hide notification" onClick={handleDismiss} size="small" sx={{ color: "inherit", borderRadius: "10px" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          alignItems: "center",
          border: "1px solid #bfdbfe",
          borderRadius: "16px",
          backgroundColor: "#eff6ff",
          color: "#1e3a8a",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          "& .MuiAlert-icon": { color: "#2563eb", alignItems: "center" },
          "& .MuiAlert-message": { width: "100%", minWidth: 0 },
        }}
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600">New notification</p>
            <p className="mt-0.5 break-words text-sm font-extrabold text-slate-900 sm:text-[15px]">{visibleNotification.title || "ApnaAcademy Update"}</p>
            <p className="mt-0.5 break-words text-xs leading-5 text-slate-600 sm:text-sm">{visibleNotification.message || "You have a new notification."}</p>
          </div>

          {link ? (
            <button type="button" onClick={handleOpen} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-blue-600 px-3.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-blue-700 sm:self-center">
              Show
              <OpenInNewIcon sx={{ fontSize: 15 }} />
            </button>
          ) : null}
        </div>
      </Alert>
    </div>
  );
}
