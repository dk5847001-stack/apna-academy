import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AutoAwesome,
  AutoStories,
  Book,
  ChevronLeft,
  ChevronRight,
  Refresh,
  School,
  SearchOff,
} from "@mui/icons-material";

import api from "../services/api";

import CourseCard from "../components/courses/CourseCard";
import CourseSkeleton from "../components/courses/CourseSkeleton";
import CourseFilters from "../components/courses/CourseFilters";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [level, setLevel] = useState("All Levels");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Fetch courses from backend
   */
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 12,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category !== "All Categories") {
        params.category = category;
      }

      if (level !== "All Levels") {
        params.level = level;
      }

      const response = await api.get("/courses", {
        params,
      });

      const result = response?.data?.data;

      setCourses(result?.courses || []);

      setPagination(
        result?.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Course fetch error:", err);

      setCourses([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category, level]);

  /*
   * Fetch whenever page/filter changes
   */
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /*
   * Reset all filters
   */
  const handleReset = () => {
    setSearch("");
    setCategory("All Categories");
    setLevel("All Levels");
    setPage(1);
  };

  /*
   * Search change
   */
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  /*
   * Category change
   */
  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  /*
   * Level change
   */
  const handleLevelChange = (value) => {
    setLevel(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />

      </div>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* =======================================================
            HERO SECTION
        ======================================================= */}
        <section className="mb-10">

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">

            {/* HERO CONTENT */}
            <div className="max-w-3xl">

              <Chip
                icon={<AutoStories fontSize="small" />}
                label="Explore ApnaAcademy"
                variant="outlined"
                className="!mb-5 !border-cyan-400/20 !bg-cyan-400/10 !text-cyan-300"
              />

              <Typography
                component="h1"
                className="!text-4xl !font-black !leading-tight !tracking-tight !text-white sm:!text-5xl lg:!text-6xl"
              >
                Learn skills that

                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  move you forward.
                </span>
              </Typography>

              <Typography
                component="p"
                className="!mt-5 !max-w-2xl !text-base !leading-7 !text-slate-400 sm:!text-lg"
              >
                Explore practical courses designed to help you
                build real-world technology skills and grow your
                career.
              </Typography>

            </div>

            {/* COURSE COUNT */}
            {!loading && !error && (
              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 shadow-xl backdrop-blur-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <School />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-white">
                      {pagination.total}
                    </p>

                    <p className="text-xs text-slate-500">
                      Courses available
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>

        </section>

        {/* =======================================================
            FILTERS
        ======================================================= */}
        <CourseFilters
          search={search}
          setSearch={handleSearchChange}
          category={category}
          setCategory={handleCategoryChange}
          level={level}
          setLevel={handleLevelChange}
          onReset={handleReset}
        />

        {/* =======================================================
            RESULT SUMMARY
        ======================================================= */}
        {!loading && !error && (
          <div className="mb-6 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">

              <Book
                fontSize="small"
                className="!text-slate-500"
              />

              <Typography
                component="p"
                className="!text-sm !text-slate-400"
              >
                Showing{" "}

                <span className="font-bold text-slate-200">
                  {courses.length}
                </span>{" "}

                of{" "}

                <span className="font-bold text-slate-200">
                  {pagination.total}
                </span>{" "}

                courses
              </Typography>

            </div>

            {pagination.totalPages > 0 && (
              <Typography
                component="p"
                className="!text-sm !font-medium !text-slate-500"
              >
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </Typography>
            )}

          </div>
        )}

        {/* =======================================================
            LOADING STATE
        ======================================================= */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 6 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))}

          </div>
        )}

        {/* =======================================================
            ERROR STATE
        ======================================================= */}
        {!loading && error && (
          <section className="rounded-[2rem] border border-red-400/15 bg-red-400/[0.05] p-8 shadow-xl backdrop-blur-xl sm:p-14">

            <div className="mx-auto max-w-md text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/10 text-2xl font-black text-red-300">
                !
              </div>

              <Typography
                component="h2"
                className="!mt-5 !text-xl !font-bold !text-white"
              >
                Unable to load courses
              </Typography>

              <Typography
                component="p"
                className="!mt-2 !text-sm !leading-6 !text-slate-400"
              >
                {error}
              </Typography>

              <Button
                type="button"
                onClick={fetchCourses}
                startIcon={<Refresh />}
                variant="contained"
                className="!mt-6 !rounded-xl !bg-white !px-5 !py-3 !text-sm !font-bold !normal-case !text-slate-950 hover:!bg-slate-200"
              >
                Try Again
              </Button>

            </div>

          </section>
        )}

        {/* =======================================================
            EMPTY STATE
        ======================================================= */}
        {!loading && !error && courses.length === 0 && (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center shadow-xl backdrop-blur-xl sm:p-16">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500">
              <SearchOff fontSize="large" />
            </div>

            <Typography
              component="h2"
              className="!mt-6 !text-2xl !font-bold !text-white"
            >
              No courses found
            </Typography>

            <Typography
              component="p"
              className="mx-auto !mt-3 !max-w-md !text-sm !leading-6 !text-slate-500"
            >
              We couldn't find any courses matching your
              current search or filters.
            </Typography>

            <Button
              type="button"
              onClick={handleReset}
              startIcon={<Refresh />}
              variant="outlined"
              className="!mt-6 !rounded-xl !border-white/10 !bg-white/5 !px-5 !py-3 !text-sm !font-semibold !normal-case !text-slate-200 hover:!border-white/20 hover:!bg-white/10"
            >
              Clear Filters
            </Button>

          </section>
        )}

        {/* =======================================================
            COURSE GRID
        ======================================================= */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}

          </div>
        )}

        {/* =======================================================
            PAGINATION
        ======================================================= */}
        {!loading &&
          !error &&
          pagination.totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-3"
              aria-label="Course pagination"
            >

              {/* PREVIOUS */}
              <Button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
                startIcon={<ChevronLeft />}
                variant="outlined"
                className="!min-h-11 !rounded-xl !border-white/10 !bg-white/5 !px-4 !text-sm !font-semibold !normal-case !text-slate-300 hover:!border-white/20 hover:!bg-white/10 disabled:!opacity-40"
              >
                Previous
              </Button>

              {/* CURRENT PAGE */}
              <Box className="flex !min-h-11 !min-w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-300">
                {pagination.page}
              </Box>

              {/* NEXT */}
              <Button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                endIcon={<ChevronRight />}
                variant="outlined"
                className="!min-h-11 !rounded-xl !border-white/10 !bg-white/5 !px-4 !text-sm !font-semibold !normal-case !text-slate-300 hover:!border-white/20 hover:!bg-white/10 disabled:!opacity-40"
              >
                Next
              </Button>

            </nav>
          )}

        {/* =======================================================
            BOTTOM CTA
        ======================================================= */}
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.05] to-violet-500/[0.08] p-8 shadow-xl backdrop-blur-xl sm:p-10">

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="max-w-2xl">

              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <AutoAwesome fontSize="small" />
                Build. Learn. Grow.
              </div>

              <Typography
                component="h2"
                className="!mt-2 !text-2xl !font-bold !text-white sm:!text-3xl"
              >
                Start your learning journey today.
              </Typography>

              <Typography
                component="p"
                className="!mt-2 !text-sm !leading-6 !text-slate-400"
              >
                Choose a course and start building practical
                skills with ApnaAcademy.
              </Typography>

            </div>

            <Link
              to="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              <ArrowBack fontSize="small" />
              Back to Home
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}