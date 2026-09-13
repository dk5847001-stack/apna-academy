import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
} from "@mui/material";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CircleNotificationsOutlinedIcon from "@mui/icons-material/CircleNotificationsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import notificationService from "../services/notification.service";

const TYPE_CONFIG = {
  course: {
    label: "Course",
    icon: MenuBookOutlinedIcon,
    iconClass: "bg-blue-50 text-blue-600",
  },
  "course-update": {
    label: "Course update",
    icon: MenuBookOutlinedIcon,
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  certificate: {
    label: "Certificate",
    icon: EmojiEventsOutlinedIcon,
    iconClass: "bg-amber-50 text-amber-600",
  },
  "module-unlocked": {
    label: "Learning",
    icon: LockOpenOutlinedIcon,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  purchase: {
    label: "Payment",
    icon: PaymentsOutlinedIcon,
    iconClass: "bg-violet-50 text-violet-600",
  },
  announcement: {
    label: "Announcement",
    icon: CampaignOutlinedIcon,
    iconClass: "bg-sky-50 text-sky-600",
  },
  promotion: {
    label: "Offer",
    icon: CardGiftcardOutlinedIcon,
    iconClass: "bg-rose-50 text-rose-600",
  },
  system: {
    label: "System",
    icon: SettingsOutlinedIcon,
    iconClass: "bg-slate-100 text-slate-600",
  },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type] || TYPE_CONFIG.system;

const formatNotificationDate = (date) => {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - value.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: value.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await notificationService.getNotifications({
        limit: 50,
      });

      setNotifications(data?.notifications || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          "Unable to load your notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (notification) => {
    if (!notification?._id || notification.isRead) return;

    setBusyId(String(notification._id));

    try {
      await notificationService.markNotificationAsRead(
        notification._id
      );

      setNotifications((current) =>
        current.map((item) =>
          String(item._id) === String(notification._id)
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (markError) {
      setToast(
        markError?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setBusyId("");
    }
  };

  const handleNotificationClick = async (notification) => {
    await markRead(notification);

    if (!notification?.link) return;

    if (/^https?:\/\//i.test(notification.link)) {
      window.location.assign(notification.link);
      return;
    }

    navigate(notification.link);
  };

  const markAllRead = async () => {
    if (!unreadCount || markingAll) return;

    setMarkingAll(true);

    try {
      await notificationService.markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setToast("All notifications marked as read.");
    } catch (markError) {
      setToast(
        markError?.message ||
          "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <CircleNotificationsOutlinedIcon sx={{ fontSize: 22 }} />
            <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
              Updates
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Stay updated with your courses, learning progress,
            certificates, payments and important announcements.
          </p>
        </div>

        <Button
          variant="outlined"
          onClick={markAllRead}
          disabled={!unreadCount || markingAll}
          startIcon={
            markingAll ? (
              <CircularProgress size={16} />
            ) : (
              <CheckCircleOutlineIcon />
            )
          }
          sx={{
            alignSelf: "flex-start",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 800,
            minHeight: 42,
          }}
        >
          {markingAll ? "Updating..." : "Mark all as read"}
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Paper
          elevation={0}
          className="border border-slate-200 bg-white p-4"
          sx={{ borderRadius: "16px" }}
        >
          <p className="text-xs font-semibold text-slate-500">
            Total notifications
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {notifications.length}
          </p>
        </Paper>

        <Paper
          elevation={0}
          className="border border-blue-100 bg-blue-50/60 p-4"
          sx={{ borderRadius: "16px" }}
        >
          <p className="text-xs font-semibold text-blue-600">
            Unread
          </p>
          <p className="mt-1 text-2xl font-extrabold text-blue-700">
            {unreadCount}
          </p>
        </Paper>

        <Paper
          elevation={0}
          className="col-span-2 border border-slate-200 bg-white p-4 sm:col-span-1"
          sx={{ borderRadius: "16px" }}
        >
          <p className="text-xs font-semibold text-slate-500">
            Status
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {unreadCount ? "You have new updates" : "You're all caught up"}
          </p>
        </Paper>
      </div>

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadNotifications}>
              Retry
            </Button>
          }
          className="mb-5"
        >
          {error}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        className="overflow-hidden border border-slate-200 bg-white"
        sx={{ borderRadius: "20px" }}
      >
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <CircularProgress size={34} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#eff6ff",
                color: "#2563eb",
              }}
            >
              <CircleNotificationsOutlinedIcon />
            </Avatar>
            <h2 className="mt-5 text-lg font-extrabold text-slate-900">
              No notifications yet
            </h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Important course, payment and learning updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const config = getTypeConfig(notification.type);
              const Icon = config.icon;
              const unread = !notification.isRead;
              const busy =
                busyId === String(notification._id);

              return (
                <div
                  key={notification._id}
                  className={`group flex gap-3 px-4 py-4 transition-colors sm:gap-4 sm:px-6 ${
                    unread
                      ? "bg-blue-50/45 hover:bg-blue-50/70"
                      : "bg-white hover:bg-slate-50/80"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}
                  >
                    <Icon sx={{ fontSize: 21 }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        {config.label}
                      </span>

                      {unread ? (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                          New
                        </span>
                      ) : null}
                    </div>

                    <h3
                      className={`mt-1 text-sm leading-5 ${
                        unread
                          ? "font-extrabold text-slate-900"
                          : "font-bold text-slate-700"
                      }`}
                    >
                      {notification.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[11px] font-semibold text-slate-400">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </button>

                  <div className="flex shrink-0 items-start gap-1">
                    {unread ? (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          disabled={busy}
                          onClick={() => markRead(notification)}
                          aria-label="Mark notification as read"
                        >
                          {busy ? (
                            <CircularProgress size={17} />
                          ) : (
                            <CheckCircleOutlineIcon sx={{ fontSize: 19 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Paper>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast("")}
        message={toast}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setToast("")}
            aria-label="Close message"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
}
