import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Avatar,
  Button,
  Chip,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  AutoAwesome,
  MenuBook,
  PlayArrow,
  Schedule,
  Search as SearchIcon,
  VideoLibrary,
  WorkspacePremium,
  School as SchoolIcon,
} from "@mui/icons-material";

import { COURSE_ROUTES, ROUTES } from "../constants/config";
import dashboardService from "../services/dashboard.service";

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return "Free";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "A";
}

function getLevelLabel(level) {
  if (!level) {
    return "All Levels";
  }

  return String(level)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getCourseId(course) {
  return String(course?.id || course?._id || "");
}

function CourseCard({ course, enrolled }) {
  const courseSlug = String(course?.slug || "").trim();
  const courseTarget = enrolled
    ? COURSE_ROUTES.LEARN(courseSlug)
    : COURSE_ROUTES.DETAILS(courseSlug);

  return (
    <article
      className="
        group
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-md
      "
    >
      <div
        className="
          relative
          block
          aspect-[16/8]
          overflow-hidden
          bg-slate-100
        "
      >
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={
              course.title
                ? `${course.title} course thumbnail`
                : "ApnaAcademy course"
            }
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.02]
            "
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-blue-50 text-blue-600">
            <SchoolIcon sx={{ fontSize: 52 }} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1.5">
          {course.isFeatured && (
            <Chip
              icon={<AutoAwesome sx={{ fontSize: 11 }} />}
              label="Featured"
              size="small"
              className="
                !h-5
                !bg-white
                !px-0
                !text-[7px]
                !font-bold
                !text-slate-800
                !shadow-sm
              "
            />
          )}

          {enrolled && (
            <Chip
              icon={<WorkspacePremium sx={{ fontSize: 11 }} />}
              label="Enrolled"
              size="small"
              className="
                !h-5
                !bg-white/95
                !px-0
                !text-[7px]
                !font-bold
                !text-slate-800
                !shadow-sm
              "
            />
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg">
            <PlayArrow sx={{ fontSize: 18 }} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2.5 py-2.5 sm:px-3 sm:py-3">
        <div className="mb-1.5 flex min-w-0 gap-1">
          <Chip
            label={getLevelLabel(course.level)}
            size="small"
            variant="outlined"
            className="
              !h-[18px]
              !max-w-[65%]
              !border-blue-200
              !bg-blue-50
              !px-0
              !text-[7px]
              !font-bold
              !text-blue-700
              sm:!h-5
              sm:!text-[8px]
            "
          />

          {course.language && (
            <Chip
              label={course.language}
              size="small"
              variant="outlined"
              className="
                !h-[18px]
                !max-w-[35%]
                !border-slate-200
                !bg-slate-50
                !px-0
                !text-[7px]
                !font-medium
                !text-slate-500
                sm:!h-5
                sm:!text-[8px]
              "
            />
          )}
        </div>

        <Link to={courseTarget} className="block no-underline">
          <Typography
            component="h2"
            className="
              line-clamp-2
              !text-[11px]
              !font-extrabold
              !leading-[15px]
              !tracking-tight
              !text-slate-900
              group-hover:!text-blue-700
              sm:!text-[14px]
              sm:!leading-[18px]
            "
          >
            {course.title || "Untitled Course"}
          </Typography>
        </Link>

        <Typography
          component="p"
          className="
            mt-1
            line-clamp-2
            !text-[8px]
            !leading-[13px]
            !text-slate-500
            sm:!text-[10px]
            sm:!leading-4
          "
        >
          {course.shortDescription ||
            "Practical learning designed for real-world skills."}
        </Typography>

        <div className="mt-1.5 flex min-w-0 items-center gap-1">
          <Avatar
            src={course.instructor?.avatar || undefined}
            alt={course.instructor?.name || "ApnaAcademy instructor"}
            slotProps={{ img: { loading: "lazy" } }}
            className="
              !h-5
              !w-5
              !shrink-0
              !bg-blue-100
              !text-[7px]
              !font-bold
              !text-blue-700
              sm:!h-6
              sm:!w-6
              sm:!text-[8px]
            "
          >
            {getInitial(course.instructor?.name)}
          </Avatar>

          <Typography
            component="span"
            className="
              min-w-0
              truncate
              !text-[8px]
              !font-semibold
              !text-slate-600
              sm:!text-[9px]
            "
          >
            {course.instructor?.name || "ApnaAcademy"}
          </Typography>
        </div>

        <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          <div className="flex min-w-0 items-center justify-center gap-0.5 px-1 py-1.5">
            <MenuBook sx={{ fontSize: 12 }} className="!text-blue-600" />
            <Typography component="span" className="truncate !text-[8px] !font-extrabold !text-slate-800 sm:!text-[9px]">
              {course.totalModules || 0}
            </Typography>
          </div>

          <div className="flex min-w-0 items-center justify-center gap-0.5 border-x border-slate-200 px-1 py-1.5">
            <VideoLibrary sx={{ fontSize: 12 }} className="!text-indigo-600" />
            <Typography component="span" className="truncate !text-[8px] !font-extrabold !text-slate-800 sm:!text-[9px]">
              {course.totalVideos || 0}
            </Typography>
          </div>

          <div className="flex min-w-0 items-center justify-center gap-0.5 px-1 py-1.5">
            <Schedule sx={{ fontSize: 12 }} className="!text-violet-600" />
            <Typography component="span" className="truncate !text-[8px] !font-extrabold !text-slate-800 sm:!text-[9px]">
              {Number(course.durationDays) > 0 ? `${course.durationDays}d` : "Self"}
            </Typography>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2">
          <div className="min-w-0">
            <Typography component="p" className="!text-[8px] !font-bold !uppercase !tracking-wide !text-slate-400 sm:!text-[9px]">
              Starting at
            </Typography>
            <Typography component="p" className="!mt-0.5 !text-xs !font-extrabold !leading-4 !text-slate-950 sm:!text-sm">
              {formatPrice(course.price)}
            </Typography>
          </div>

          <Button
            component={Link}
            to={courseTarget}
            variant="contained"
            endIcon={
              enrolled ? (
                <PlayArrow sx={{ fontSize: { xs: 11, sm: 13 } }} />
              ) : (
                <ArrowForward sx={{ fontSize: { xs: 11, sm: 13 } }} />
              )
            }
            disabled={!courseSlug}
            className="
              !min-h-7
              !shrink-0
              !rounded-md
              !bg-blue-600
              !px-2
              !py-1
              !text-[8px]
              !font-bold
              !normal-case
              !leading-none
              !text-white
              !shadow-none
              hover:!bg-blue-700
              sm:!min-h-8
              sm:!px-2.5
              sm:!text-[10px]
            "
          >
            {enrolled ? "Open" : "View"}
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
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-[16/8] animate-pulse bg-slate-200" />
          <div className="p-3 sm:p-3.5">
            <div className="animate-pulse">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-5 w-4/5 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
              <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
              <div className="mt-4 h-8 w-full rounded-md bg-slate-200" />
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
                      endIcon={<ArrowForward />}
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
                <PlayArrow />
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
              endIcon={<ArrowForward />}
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
