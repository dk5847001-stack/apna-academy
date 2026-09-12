import { useMemo } from "react";
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

/* =========================================================
   HELPERS
========================================================= */

function getFirstName(name = "") {
  const firstName = name.trim().split(/\s+/)[0];

  return firstName || "Student";
}

function getInitials(name = "") {
  const parts = name
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

/* =========================================================
   DEMO / EMPTY STATE DATA
   ---------------------------------------------------------
   Real backend data will replace these values in the
   dashboard data-integration steps.
========================================================= */

const dashboardStats = [
  {
    label: "Enrolled Courses",
    value: "0",
    icon: SchoolIcon,
    iconClass:
      "bg-blue-50 text-blue-600",
  },
  {
    label: "Overall Progress",
    value: "0%",
    icon: TrendingUpIcon,
    iconClass:
      "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Certificates",
    value: "0",
    icon: WorkspacePremiumIcon,
    iconClass:
      "bg-amber-50 text-amber-600",
  },
  {
    label: "Purchases",
    value: "0",
    icon: ShoppingBagIcon,
    iconClass:
      "bg-violet-50 text-violet-600",
  },
];

const recentNotifications = [
  {
    id: 1,
    title: "Welcome to ApnaAcademy",
    description:
      "Your student dashboard is ready.",
    time: "Just now",
  },
  {
    id: 2,
    title: "Start your learning journey",
    description:
      "Explore courses and choose a skill to learn.",
    time: "Today",
  },
];

const continueLearning = null;

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
              Once you enroll in a course and start
              watching lessons, your latest learning
              activity will appear here.
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
  course,
}) {
  if (!course) {
    return <ContinueLearningEmpty />;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <div className="relative min-h-48 bg-slate-100">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full min-h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center bg-blue-50 text-blue-600">
              <SchoolIcon sx={{ fontSize: 52 }} />
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
            {course.title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {course.module || "Next lesson"}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">
                Course progress
              </span>

              <span className="text-blue-600">
                {course.progress || 0}%
              </span>
            </div>

            <LinearProgress
              variant="determinate"
              value={course.progress || 0}
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
              to={course.url || ROUTES.MY_COURSES}
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
              <AccessTimeIcon sx={{ fontSize: 16 }} />

              {course.lastWatched ||
                "Recently watched"}
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
          startIcon={<NotificationsNoneIcon />}
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

function RecentNotifications() {
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
        {recentNotifications.map(
          (notification) => (
            <div
              key={notification.id}
              className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <NotificationsNoneIcon
                  sx={{ fontSize: 18 }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {notification.title}
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {notification.description}
                </p>

                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                  {notification.time}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* =========================================================
   LEARNING STATUS
========================================================= */

function LearningStatus() {
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
                Start a course to track progress.
              </p>
            </div>
          </div>

          <span className="text-lg font-extrabold text-slate-800">
            0%
          </span>
        </div>

        <LinearProgress
          variant="determinate"
          value={0}
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
   MAIN DASHBOARD
========================================================= */

export default function DashboardHome() {
  const { user } = useAuth();

  const firstName = useMemo(
    () => getFirstName(user?.name),
    [user?.name]
  );

  const initials = useMemo(
    () => getInitials(user?.name),
    [user?.name]
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* =================================================
            WELCOME HEADER
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="absolute right-0 top-0 hidden h-40 w-40 rounded-full bg-blue-50 blur-3xl sm:block" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  src={user?.avatar || ""}
                  alt={user?.name || "Student"}
                  sx={{
                    width: 52,
                    height: 52,
                    fontSize: 16,
                    fontWeight: 800,
                    bgcolor: "#dbeafe",
                    color: "#1d4ed8",
                  }}
                >
                  {initials}
                </Avatar>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                    Student Dashboard
                  </p>

                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Welcome back, {firstName}!
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Keep learning, keep growing.
                  </p>
                </div>
              </div>

              <Button
                component={Link}
                to={ROUTES.COURSES}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  minHeight: 44,
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
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================== */}

        <section className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
            />
          ))}
        </section>

        {/* =================================================
            CONTINUE LEARNING
        ================================================== */}

        <div className="mt-5">
          <ContinueLearningCard
            course={continueLearning}
          />
        </div>

        {/* =================================================
            LOWER CONTENT
        ================================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LearningStatus />
          </div>

          <div>
            <QuickActions />
          </div>
        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="mt-5">
          <RecentNotifications />
        </div>
      </div>
    </div>
  );
}