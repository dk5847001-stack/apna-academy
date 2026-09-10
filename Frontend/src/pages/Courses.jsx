import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

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

      const result = response.data?.data;

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
        err.response?.data?.message ||
          "Unable to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category, level]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /**
   * Reset filters.
   */
  const handleReset = () => {
    setSearch("");
    setCategory("All Categories");
    setLevel("All Levels");
    setPage(1);
  };

  /**
   * Changing filters should always return to page 1.
   */
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleLevelChange = (value) => {
    setLevel(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[25%] h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Header */}
        <section className="mb-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
              <BookOpen size={15} />
              Explore ApnaAcademy
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn skills that
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                move you forward.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Explore practical courses designed to help you
              build real-world technology skills and grow your
              career.
            </p>
          </div>
        </section>

        {/* Filters */}
        <CourseFilters
          search={search}
          setSearch={handleSearchChange}
          category={category}
          setCategory={handleCategoryChange}
          level={level}
          setLevel={handleLevelChange}
          onReset={handleReset}
        />

        {/* Result summary */}
        {!loading && !error && (
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-200">
                {courses.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-200">
                {pagination.total}
              </span>{" "}
              courses
            </p>

            {pagination.totalPages > 0 && (
              <p className="text-sm text-slate-500">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <section className="rounded-3xl border border-red-400/15 bg-red-400/[0.05] p-8 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
                !
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Unable to load courses
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchCourses}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BookOpen
                size={28}
                className="text-slate-500"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-white">
              No courses found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find any courses matching your
              current search or filters.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Clear Filters
            </button>
          </section>
        )}

        {/* Courses */}
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

        {/* Pagination */}
        {!loading &&
          !error &&
          pagination.totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-3"
              aria-label="Course pagination"
            >
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <div className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-300">
                {pagination.page}
              </div>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </nav>
          )}

        {/* Bottom CTA */}
        <section className="mt-16 overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.05] to-violet-500/[0.08] p-8 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-300">
                Build. Learn. Grow.
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Start your learning journey today.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Choose a course and start building practical
                skills with ApnaAcademy.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}