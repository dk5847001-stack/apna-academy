import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { ROUTES } from "../constants/config";
import dashboardService from "../services/dashboard.service";

function clampProgress(value) {
  const progress = Number(value || 0);
  return Math.min(100, Math.max(0, progress));
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CourseCard({ course }) {
  const progress = clampProgress(course.progress);
  const isCompleted = Boolean(course.isCompleted);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] bg-slate-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-blue-50 text-blue-600">
            <SchoolIcon sx={{ fontSize: 48 }} />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <Chip
            label={isCompleted ? "Completed" : "Enrolled"}
            size="small"
            icon={
              isCompleted ? (
                <WorkspacePremiumIcon sx={{ fontSize: 16 }} />
              ) : undefined
            }
            sx={{
              backgroundColor: "rgba(255,255,255,0.95)",
              fontWeight: 700,
            }}
          />
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {course.category && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              {course.category}
            </span>
          )}

          {course.level && (
            <span className="text-[11px] font-semibold text-slate-400">
              {course.level}
            </span>
          )}
        </div>

        <h2 className="mt-3 line-clamp-2 text-lg font-bold tracking-tight text-slate-900">
          {course.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.shortDescription ||
            "Continue learning and build practical skills with ApnaAcademy."}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
            <span className="text-slate-500">Progress</span>
            <span className="text-blue-600">{progress}%</span>
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

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-400">
            {course.purchase?.purchasedAt
              ? `Purchased ${formatDate(course.purchase.purchasedAt)}`
              : "Active enrollment"}
          </div>

          <Button
            component={Link}
            to={ROUTES.COURSES}
            variant="contained"
            startIcon={
              isCompleted ? (
                <WorkspacePremiumIcon />
              ) : (
                <PlayArrowIcon />
              )
            }
            endIcon={<ArrowForwardIcon />}
            sx={{
              minHeight: 42,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            {isCompleted ? "View Course" : "Continue"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-[16/9] animate-pulse bg-slate-200" />
          <div className="p-5">
            <div className="animate-pulse">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-6 h-2 w-full rounded bg-slate-100" />
              <div className="mt-5 h-10 w-28 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const dashboard = await dashboardService.getDashboard();
      const enrolledCourses = Array.isArray(dashboard?.enrolledCourses)
        ? dashboard.enrolledCourses
        : [];

      setCourses(enrolledCourses);
    } catch (requestError) {
      console.error("My Courses loading failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const completedCount = courses.filter(
    (course) => course.isCompleted
  ).length;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                Learning Library
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                My Courses
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Access your active courses, continue lessons, and track your learning progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip
                label={`${courses.length} enrolled`}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`${completedCount} completed`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <section className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Unable to load courses
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {error}
            </p>
            <Button
              onClick={loadCourses}
              variant="contained"
              sx={{
                mt: 4,
                minHeight: 42,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              Try Again
            </Button>
          </section>
        ) : courses.length === 0 ? (
          <section className="rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <SchoolIcon sx={{ fontSize: 28 }} />
            </div>

            <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
              No courses yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              You have not enrolled in a course yet. Explore the available courses and start learning.
            </p>

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
          </section>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
