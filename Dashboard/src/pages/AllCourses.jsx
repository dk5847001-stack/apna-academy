import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Chip,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { ROUTES } from "../constants/config";
import dashboardService from "../services/dashboard.service";

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return "Free";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

function formatDuration(days) {
  const value = Number(days);

  if (!Number.isFinite(value) || value <= 0) {
    return "Self-paced";
  }

  if (value % 30 === 0) {
    const months = value / 30;
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  return `${value} days`;
}

function getCourseId(course) {
  return String(course?.id || course?._id || "");
}

function CourseCard({ course, enrolled }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-blue-50 text-blue-600">
            <SchoolIcon sx={{ fontSize: 52 }} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {course.isFeatured && (
            <Chip
              label="Featured"
              size="small"
              color="primary"
              sx={{
                backgroundColor: "rgba(255,255,255,0.95)",
                color: "#1d4ed8",
                fontWeight: 800,
              }}
            />
          )}

          {enrolled && (
            <Chip
              label="Enrolled"
              size="small"
              icon={<WorkspacePremiumIcon sx={{ fontSize: 16 }} />}
              sx={{
                backgroundColor: "rgba(255,255,255,0.95)",
                fontWeight: 800,
              }}
            />
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {course.category && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              {course.category}
            </span>
          )}

          {course.level && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {course.level}
            </span>
          )}
        </div>

        <h2 className="mt-3 line-clamp-2 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          {course.title}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
          {course.shortDescription ||
            "Build practical skills through structured learning with ApnaAcademy."}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            {formatDuration(course.durationDays)}
          </span>

          {course.totalModules > 0 && (
            <span>{course.totalModules} modules</span>
          )}

          {course.totalVideos > 0 && (
            <span>{course.totalVideos} lessons</span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Starting at
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-slate-900">
              {formatPrice(course.price)}
            </p>
          </div>

          <Button
            component={Link}
            to={ROUTES.COURSES}
            variant={enrolled ? "outlined" : "contained"}
            endIcon={<ArrowForwardIcon />}
            sx={{
              minHeight: 42,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            {enrolled ? "Open" : "View Course"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-[16/9] animate-pulse bg-slate-200" />
          <div className="p-5 sm:p-6">
            <div className="animate-pulse">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-6 w-4/5 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-6 h-4 w-1/2 rounded bg-slate-100" />
              <div className="mt-5 h-10 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        courses
          .map((course) => course.category)
          .filter(Boolean)
      )
    ).sort();
  }, [courses]);

  const levels = useMemo(() => {
    return Array.from(
      new Set(
        courses
          .map((course) => course.level)
          .filter(Boolean)
      )
    ).sort();
  }, [courses]);

  const loadCourses = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const [catalog, dashboard] = await Promise.all([
        dashboardService.getCourses({
          page,
          limit: 12,
          search,
          category,
          level,
        }),
        dashboardService.getDashboard(),
      ]);

      const nextCourses = Array.isArray(catalog?.courses)
        ? catalog.courses
        : [];

      const nextPagination = catalog?.pagination || {};
      const enrolledCourses = Array.isArray(dashboard?.enrolledCourses)
        ? dashboard.enrolledCourses
        : [];

      setCourses(nextCourses);
      setPagination({
        page: Number(nextPagination.page) || page,
        totalPages: Number(nextPagination.totalPages) || 1,
        total: Number(nextPagination.total) || nextCourses.length,
      });

      setEnrolledIds(
        new Set(
          enrolledCourses
            .map(getCourseId)
            .filter(Boolean)
        )
      );
    } catch (requestError) {
      console.error("All Courses loading failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load available courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses(1);
  }, [search, category, level]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setLevel("");
  };

  const hasFilters = Boolean(search || category || level);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              Learning Catalog
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  All Courses
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Explore practical courses, choose your learning path, and start building real-world skills.
                </p>
              </div>

              <Chip
                label={`${pagination.total} courses available`}
                size="small"
                sx={{
                  width: "fit-content",
                  fontWeight: 700,
                }}
              />
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]"
            >
              <TextField
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search courses, skills or categories..."
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{
                        mr: 1,
                        color: "#94a3b8",
                      }}
                    />
                  ),
                }}
              />

              <Select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                size="small"
                displayEmpty
                fullWidth
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>

              <Select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                size="small"
                displayEmpty
                fullWidth
              >
                <MenuItem value="">All Levels</MenuItem>
                {levels.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>

              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                sx={{
                  minHeight: 40,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                Search
              </Button>
            </form>

            {hasFilters && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-400">
                  Showing filtered results
                </p>

                <Button
                  type="button"
                  onClick={handleClearFilters}
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Unable to load courses
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {error}
              </p>
              <Button
                onClick={() => loadCourses(pagination.page)}
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
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <SchoolIcon sx={{ fontSize: 28 }} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No courses found
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Try a different search term or clear the filters to see all available courses.
              </p>
              <Button
                onClick={handleClearFilters}
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
                Show All Courses
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={getCourseId(course)}
                    course={course}
                    enrolled={enrolledIds.has(getCourseId(course))}
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-7 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                  <p className="text-xs font-semibold text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => loadCourses(pagination.page - 1)}
                      disabled={pagination.page <= 1 || loading}
                      variant="outlined"
                      sx={{
                        minHeight: 40,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Previous
                    </Button>

                    <Button
                      onClick={() => loadCourses(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages || loading}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        minHeight: 40,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: "none",
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <PlayArrowIcon />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Ready to start learning?
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Select a course to view its complete details, modules, previews, pricing and enrollment options.
                </p>
              </div>
            </div>

            <Button
              component={Link}
              to={ROUTES.MY_COURSES}
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{
                minHeight: 40,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                width: "100%",
                flexShrink: 0,
                "@media (min-width: 640px)": {
                  width: "auto",
                },
              }}
            >
              My Courses
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
