import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Avatar,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/config";
import dashboardService from "../services/dashboard.service";

/* =========================================================
   HELPERS
========================================================= */

function getFirstName(name = "") {
  const firstName = String(name)
    .trim()
    .split(/\s+/)[0];

  return firstName || "Student";
}

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function clampProgress(value) {
  const progress = Number(value || 0);

  if (Number.isNaN(progress)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(progress))
  );
}

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diff = Date.now() - date.getTime();

  if (diff < 60 * 1000) {
    return "Just now";
  }

  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(
      diff / (60 * 1000)
    );

    return `${minutes}m ago`;
  }

  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(
      diff / (60 * 60 * 1000)
    );

    return `${hours}h ago`;
  }

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(
      diff / (24 * 60 * 60 * 1000)
    );

    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getContinueCourseUrl(course) {
  if (!course) {
    return ROUTES.MY_COURSES;
  }

  return course.url || ROUTES.MY_COURSES;
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon sx={{ fontSize: 22 }} />
        </div>

        <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Total
        </span>
      </div>

      <p className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY CONTINUE LEARNING
========================================================= */

function ContinueLearningEmpty() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <PlayArrowIcon />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              Continue Learning
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              Nothing to continue yet
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              Once you enroll in a course and
              start watching lessons, your latest
              learning activity will appear here.
            </p>
          </div>
        </div>

        <Button
          component={Link}
          to={ROUTES.COURSES}
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            minHeight: 42,
            width: "100%",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "@media (min-width: 640px)": {
              width: "auto",
            },
          }}
        >
          Explore Courses
        </Button>
      </div>
    </section>
  );
}

/* =========================================================
   CONTINUE LEARNING CARD
========================================================= */

function ContinueLearningCard({
  data,
}) {
  if (!data?.course) {
    return <ContinueLearningEmpty />;
  }

  const course = data.course;
  const video = data.video;

  const progress = clampProgress(
    course.progress
  );

  const courseUrl =
    getContinueCourseUrl(course);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <div className="relative min-h-48 bg-slate-100">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title || "Course"}
              className="h-full min-h-48 w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center bg-blue-50 text-blue-600">
              <SchoolIcon
                sx={{ fontSize: 52 }}
              />
            </div>
          )}

          <div className="absolute left-3 top-3">
            <Chip
              label="Continue"
              size="small"
              sx={{
                backgroundColor:
                  "rgba(255,255,255,0.95)",
                fontWeight: 700,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
            Continue Learning
          </p>

          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {course.title ||
              "Your enrolled course"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {video?.title ||
              video?.name ||
              course.module ||
              "Continue your latest lesson"}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">
                Course progress
              </span>

              <span className="text-blue-600">
                {progress}%
              </span>
            </div>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 7,
                borderRadius: 999,
                backgroundColor: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              component={Link}
              to={courseUrl}
              variant="contained"
              startIcon={<PlayArrowIcon />}
              sx={{
                minHeight: 42,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              Continue
            </Button>

            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <AccessTimeIcon
                sx={{ fontSize: 16 }}
              />

              {video?.title
                ? "Last watched lesson"
                : "Recently watched"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function QuickActions() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Jump directly to the most useful areas.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          component={Link}
          to={ROUTES.COURSES}
          variant="outlined"
          startIcon={<SchoolIcon />}
          sx={{
            minHeight: 44,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Courses
        </Button>

        <Button
          component={Link}
          to={ROUTES.MY_COURSES}
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          sx={{
            minHeight: 44,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          My Courses
        </Button>

        <Button
          component={Link}
          to={ROUTES.CERTIFICATES}
          variant="outlined"
          startIcon={
            <WorkspacePremiumIcon />
          }
          sx={{
            minHeight: 44,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Certificates
        </Button>

        <Button
          component={Link}
          to={ROUTES.SUPPORT}
          variant="outlined"
          startIcon={
            <NotificationsNoneIcon />
          }
          sx={{
            minHeight: 44,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Support
        </Button>
      </div>
    </section>
  );
}

/* =========================================================
   RECENT NOTIFICATIONS
========================================================= */

function RecentNotifications({
  notifications,
}) {
  const items = Array.isArray(
    notifications
  )
    ? notifications.slice(0, 5)
    : [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Notifications
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your latest account updates.
          </p>
        </div>

        <Button
          component={Link}
          to={ROUTES.NOTIFICATIONS}
          endIcon={<ArrowForwardIcon />}
          sx={{
            minWidth: 0,
            textTransform: "none",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          View all
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {!items.length ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
            <NotificationsNoneIcon
              className="text-slate-300"
              sx={{ fontSize: 30 }}
            />

            <p className="mt-2 text-sm font-semibold text-slate-600">
              No notifications yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              You will see important account and
              course updates here.
            </p>
          </div>
        ) : (
          items.map((notification) => (
            <div
              key={
                notification.id ||
                notification._id ||
                notification.createdAt ||
                notification.title
              }
              className={`flex gap-3 rounded-xl border p-3.5 ${
                notification.isRead
                  ? "border-slate-100 bg-slate-50"
                  : "border-blue-100 bg-blue-50/60"
              }`}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <NotificationsNoneIcon
                  sx={{ fontSize: 18 }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {notification.title ||
                      "ApnaAcademy Update"}
                  </p>

                  {!notification.isRead && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                </div>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {notification.message ||
                    notification.description ||
                    "You have a new notification."}
                </p>

                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                  {formatRelativeTime(
                    notification.createdAt
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* =========================================================
   LEARNING STATUS
========================================================= */

function LearningStatus({
  overallProgress,
  completedCourses,
  enrolledCourses,
}) {
  const progress = clampProgress(
    overallProgress
  );

  const enrolledCount = Number(
    enrolledCourses || 0
  );

  const completedCount = Number(
    completedCourses || 0
  );

  const hasCourses = enrolledCount > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Learning Status
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Your overall learning activity.
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleIcon
                sx={{ fontSize: 21 }}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Overall Progress
              </p>

              <p className="text-xs text-slate-500">
                {hasCourses
                  ? `${completedCount} course${
                      completedCount === 1
                        ? ""
                        : "s"
                    } completed`
                  : "Start a course to track progress."}
              </p>
            </div>
          </div>

          <span className="text-lg font-extrabold text-slate-800">
            {progress}%
          </span>
        </div>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 3,
            height: 7,
            borderRadius: 999,
            backgroundColor: "#e2e8f0",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
            },
          }}
        />
      </div>

      <Button
        component={Link}
        to={ROUTES.PROGRESS}
        endIcon={<ArrowForwardIcon />}
        sx={{
          mt: 3,
          textTransform: "none",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        View detailed progress
      </Button>
    </section>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-slate-200" />

          <div className="mt-3 h-8 w-64 rounded bg-slate-200" />

          <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="animate-pulse">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />

                <div className="mt-5 h-7 w-16 rounded bg-slate-200" />

                <div className="mt-2 h-4 w-32 rounded bg-slate-100" />
              </div>
            </div>
          )
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-5 w-40 rounded bg-slate-200" />

          <div className="mt-4 h-4 w-64 rounded bg-slate-100" />

          <div className="mt-6 h-2 w-full rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function DashboardError({
  message,
  onRetry,
}) {
  return (
    <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <NotificationsNoneIcon />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Unable to load your dashboard
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message ||
            "Something went wrong while loading your dashboard data."}
        </p>

        <Button
          onClick={onRetry}
          variant="contained"
          sx={{
            mt: 5,
            minHeight: 42,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Try Again
        </Button>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function DashboardHome() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const firstName = useMemo(
    () =>
      getFirstName(
        dashboard?.user?.name ||
          user?.name ||
          ""
      ),
    [
      dashboard?.user?.name,
      user?.name,
    ]
  );

  const initials = useMemo(
    () =>
      getInitials(
        dashboard?.user?.name ||
          user?.name ||
          ""
      ),
    [
      dashboard?.user?.name,
      user?.name,
    ]
  );

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await dashboardService.getDashboard();

      if (!response) {
        throw new Error(
          "Dashboard data was not returned by the server."
        );
      }

      setDashboard(response);
    } catch (dashboardError) {
      console.error(
        "Dashboard loading failed:",
        dashboardError
      );

      const message =
        dashboardError?.response?.data
          ?.message ||
        dashboardError?.message ||
        "Unable to load dashboard data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     DERIVED BACKEND DATA
  ========================================================= */

  const stats =
    dashboard?.stats || {};

  const enrolledCourses =
    Array.isArray(
      dashboard?.enrolledCourses
    )
      ? dashboard.enrolledCourses
      : [];

  const certificates =
    Array.isArray(
      dashboard?.certificates
    )
      ? dashboard.certificates
      : [];

  const notifications =
    Array.isArray(
      dashboard?.notifications
    )
      ? dashboard.notifications
      : [];

  const continueLearning =
    dashboard?.continueLearning || null;

  const statCards = [
    {
      label: "Enrolled Courses",
      value: Number(
        stats.enrolledCourses || 0
      ),
      icon: SchoolIcon,
      iconClass:
        "bg-blue-50 text-blue-600",
    },
    {
      label: "Overall Progress",
      value: `${clampProgress(
        stats.overallProgress
      )}%`,
      icon: TrendingUpIcon,
      iconClass:
        "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Certificates",
      value: certificates.length,
      icon: WorkspacePremiumIcon,
      iconClass:
        "bg-amber-50 text-amber-600",
    },
    {
      label: "Purchases",
      value: Number(
        stats.purchases || 0
      ),
      icon: ShoppingBagIcon,
      iconClass:
        "bg-violet-50 text-violet-600",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome Header */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar || ""}
                alt={user?.name || "Student"}
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  fontWeight: 800,
                }}
              >
                {initials}
              </Avatar>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                  Student Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back, {firstName}!
                </h1>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Keep learning, track your progress,
                  and build your skills.
                </p>
              </div>
            </div>

            <Button
              component={Link}
              to={ROUTES.COURSES}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                minHeight: 42,
                width: "100%",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                "@media (min-width: 640px)": {
                  width: "auto",
                },
              }}
            >
              Explore Courses
            </Button>
          </div>
        </section>

        {/* Loading / Error / Dashboard */}

        {loading ? (
          <DashboardLoading />
        ) : error ? (
          <DashboardError
            message={error}
            onRetry={loadDashboard}
          />
        ) : (
          <>
            {/* Stats */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat) => (
                <StatCard
                  key={stat.label}
                  {...stat}
                />
              ))}
            </section>

            {/* Continue Learning */}

            <div className="mt-6">
              <ContinueLearningCard
                data={continueLearning}
              />
            </div>

            {/* Main Grid */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <LearningStatus
                overallProgress={
                  stats.overallProgress
                }
                completedCourses={
                  stats.completedCourses
                }
                enrolledCourses={
                  stats.enrolledCourses
                }
              />

              <QuickActions />
            </div>

            {/* Notifications */}

            <div className="mt-6">
              <RecentNotifications
                notifications={notifications}
              />
            </div>

            {/* Empty Enrolled Courses Notice */}

            {!enrolledCourses.length && (
              <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                      Start Learning
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Explore your first course
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Choose a course and begin your
                      learning journey with
                      ApnaAcademy.
                    </p>
                  </div>

                  <Button
                    component={Link}
                    to={ROUTES.COURSES}
                    variant="contained"
                    endIcon={
                      <ArrowForwardIcon />
                    }
                    sx={{
                      minHeight: 42,
                      width: "100%",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",
                      "@media (min-width: 640px)":
                        {
                          width: "auto",
                        },
                    }}
                  >
                    Browse Courses
                  </Button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}