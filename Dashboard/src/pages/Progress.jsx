import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { Link } from "react-router-dom";

import { ROUTES } from "../constants/config";
import dashboardService from "../services/dashboard.service";

const clampProgress = (value) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, Math.round(numericValue)));
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

function ProgressCourseCard({ course }) {
  const progress = clampProgress(course?.progress);
  const completedVideos = Number(course?.completedVideos || 0);
  const totalVideos = Number(course?.totalVideos || 0);
  const completed = Boolean(course?.isCompleted) || progress >= 100;

  return (
    <Paper
      elevation={0}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="h-44 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-56">
          {course?.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title || "Course"}
              loading="lazy"
              className="h-full min-h-44 w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-44 items-center justify-center bg-blue-50 text-blue-600">
              <SchoolIcon sx={{ fontSize: 48 }} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                {course?.title || "Course"}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                {course?.shortDescription ||
                  "Track your learning progress and continue building practical skills."}
              </p>
            </div>

            <Chip
              size="small"
              icon={
                completed ? (
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                ) : (
                  <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />
                )
              }
              label={completed ? "Completed" : "In Progress"}
              color={completed ? "success" : "primary"}
              variant={completed ? "filled" : "outlined"}
              className="w-fit font-semibold"
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Overall progress
              </span>
              <span className="text-sm font-extrabold text-blue-700">
                {progress}%
              </span>
            </div>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 999,
                backgroundColor: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Lessons
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {completedVideos} / {totalVideos || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {completed ? "Finished" : progress > 0 ? "Learning" : "Not started"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Completed
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {formatDate(course?.completedAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              component={Link}
              to={ROUTES.MY_COURSES}
              variant={completed ? "outlined" : "contained"}
              endIcon={<ArrowForwardIcon />}
              sx={{
                minHeight: 42,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              {completed ? "View Course" : "Continue Learning"}
            </Button>
          </div>
        </div>
      </div>
    </Paper>
  );
}

export default function Progress() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch (requestError) {
      console.error("Progress loading failed:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load your learning progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const courses = useMemo(() => {
    return Array.isArray(dashboard?.enrolledCourses)
      ? dashboard.enrolledCourses
      : [];
  }, [dashboard]);

  const stats = dashboard?.stats || {};
  const overallProgress = clampProgress(stats.overallProgress);
  const completedCourses = Number(stats.completedCourses || 0);
  const enrolledCourses = Number(stats.enrolledCourses || courses.length);

  return (
    <main className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <TrendingUpIcon />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                    Learning Analytics
                  </p>
                  <Typography
                    component="h1"
                    className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
                  >
                    Learning Progress
                  </Typography>
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Keep track of your course completion, lessons watched, and overall learning journey.
              </p>
            </div>

            {!loading && !error && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-xl font-extrabold text-slate-900">
                    {enrolledCourses}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Enrolled
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-xl font-extrabold text-slate-900">
                    {completedCourses}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Completed
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center sm:col-span-1">
                  <p className="text-xl font-extrabold text-blue-700">
                    {overallProgress}%
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-500">
                    Overall
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {loading && (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={34} />
              <Typography className="text-sm text-slate-500">
                Loading your progress...
              </Typography>
            </Stack>
          </div>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <button
                type="button"
                onClick={loadProgress}
                className="font-semibold text-red-700 hover:underline"
              >
                Retry
              </button>
            }
            className="rounded-2xl"
          >
            {error}
          </Alert>
        )}

        {!loading && !error && courses.length === 0 && (
          <Paper
            elevation={0}
            className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <SchoolIcon sx={{ fontSize: 30 }} />
            </div>
            <Typography className="mt-5 text-xl font-bold text-slate-900">
              No learning progress yet
            </Typography>
            <Typography className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Enroll in a course and start your first lesson. Your progress will appear here automatically.
            </Typography>
            <Button
              component={Link}
              to={ROUTES.COURSES}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 5,
                minHeight: 42,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              Explore Courses
            </Button>
          </Paper>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <ProgressCourseCard
                key={course?.id || course?._id || `course-${index}`}
                course={course}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
