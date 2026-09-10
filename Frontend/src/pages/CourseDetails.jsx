import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Lock,
  PlayCircle,
  User,
  Video,
} from "lucide-react";

import api from "../services/api";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=85";

export default function CourseDetails() {
  const { slug } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/courses/${slug}`);

        console.log("COURSE DETAILS API:", response.data);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to load course."
          );
        }

        const apiData = response.data.data;

        /*
          Backend response compatibility.

          Supported formats:

          1. data = course object
          2. data = {
               course: {...},
               modules: [...]
             }
        */

        let courseData;

        if (apiData?.course) {
          courseData = {
            ...apiData.course,
            modules:
              apiData.modules ||
              apiData.course.modules ||
              [],
          };
        } else {
          courseData = apiData;
        }

        setCourse(courseData);
      } catch (err) {
        console.error("Course details error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load course details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const formatDuration = (seconds) => {
    if (!seconds || Number(seconds) <= 0) {
      return "";
    }

    const totalSeconds = Number(seconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return "₹999";
    }

    const numericPrice = Number(price);

    if (numericPrice <= 0) {
      return "Free";
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-5 w-32 rounded bg-slate-800" />

          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.75fr]">
            <div>
              <div className="h-72 rounded-3xl bg-slate-800 sm:h-80" />

              <div className="mt-8 space-y-4">
                <div className="h-9 w-2/3 rounded bg-slate-800" />
                <div className="h-4 w-full rounded bg-slate-800" />
                <div className="h-4 w-5/6 rounded bg-slate-800" />
              </div>
            </div>

            <div className="h-96 rounded-3xl bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <BookOpen size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Course Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error ||
              "The requested course could not be found."}
          </p>

          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500"
          >
            <ArrowLeft size={17} />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const modules = Array.isArray(course.modules)
    ? course.modules
    : [];

  const totalVideos =
    course.totalVideos ||
    modules.reduce(
      (total, currentModule) =>
        total +
        (Array.isArray(currentModule.videos)
          ? currentModule.videos.length
          : 0),
      0
    );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-150px] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          to="/courses"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Courses
        </Link>

        {/* Hero */}
        <section className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          {/* LEFT */}
          <div>
            {/* Thumbnail */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              <img
                src={
                  course.thumbnail ||
                  FALLBACK_THUMBNAIL
                }
                alt={course.title || "Course thumbnail"}
                className="h-64 w-full object-cover sm:h-80 lg:h-[390px]"
                onError={(event) => {
                  event.currentTarget.src =
                    FALLBACK_THUMBNAIL;
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {course.isFeatured && (
                <div className="absolute left-5 top-5 rounded-full border border-blue-400/20 bg-blue-600/80 px-4 py-2 text-xs font-bold backdrop-blur">
                  ⭐ Featured Course
                </div>
              )}
            </div>

            {/* Course Information */}
            <div className="mt-7">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {course.category && (
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                    {course.category}
                  </span>
                )}

                {course.level && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
                    {String(course.level).replace(
                      "-",
                      " "
                    )}
                  </span>
                )}

                {course.language && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                    {course.language}
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {course.title || "Course"}
              </h1>

              {/* SHORT DESCRIPTION */}
              {course.shortDescription && (
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
                  {course.shortDescription}
                </p>
              )}

              {/* STATS */}
              <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4 border-y border-white/10 py-5">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <BookOpen
                    size={18}
                    className="text-blue-400"
                  />
                  <span>
                    {modules.length}{" "}
                    {modules.length === 1
                      ? "Module"
                      : "Modules"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Video
                    size={18}
                    className="text-blue-400"
                  />
                  <span>
                    {totalVideos}{" "}
                    {totalVideos === 1
                      ? "Video"
                      : "Videos"}
                  </span>
                </div>

                {course.durationDays && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Clock3
                      size={18}
                      className="text-blue-400"
                    />
                    <span>
                      {course.durationDays} Days
                    </span>
                  </div>
                )}

                {course.instructor?.name && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <User
                      size={18}
                      className="text-blue-400"
                    />
                    <span>
                      {course.instructor.name}
                    </span>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              {course.description && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold">
                    About this course
                  </h2>

                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
                    {course.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PURCHASE CARD */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-400">
                Course Price
              </p>

              <div className="mt-2">
                <span className="text-4xl font-black">
                  {formatPrice(course.price)}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Purchase this course to unlock your
                structured learning journey and access
                protected lessons.
              </p>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-bold shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500"
              >
                Enroll Now
              </button>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />
                  Structured modules
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />
                  Progress tracking
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />
                  Certificate after completion
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* CURRICULUM */}
        <section className="mt-14">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Curriculum
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Course Modules
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Preview the first lesson of every module.
              Other lessons remain locked until enrollment.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <BookOpen
                size={32}
                className="mx-auto text-slate-500"
              />

              <p className="mt-4 text-slate-400">
                No modules available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {modules.map((module, moduleIndex) => {
                const videos = Array.isArray(module.videos)
                  ? module.videos
                  : [];

                return (
                  <div
                    key={
                      module._id ||
                      module.id ||
                      moduleIndex
                    }
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                  >
                    {/* MODULE HEADER */}
                    <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 font-bold text-blue-400">
                          {moduleIndex + 1}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">
                            {module.title}
                          </h3>

                          {module.description && (
                            <p className="mt-1 text-sm text-slate-400">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Video size={15} />
                        {videos.length}{" "}
                        {videos.length === 1
                          ? "Video"
                          : "Videos"}
                      </div>
                    </div>

                    {/* VIDEOS */}
                    <div className="divide-y divide-white/5">
                      {videos.length === 0 ? (
                        <div className="p-5 text-sm text-slate-500">
                          No videos available.
                        </div>
                      ) : (
                        videos.map(
                          (video, videoIndex) => {
                            const isPreview =
                              video.isPreview === true ||
                              videoIndex === 0;

                            const isLocked =
                              video.isLocked === true ||
                              !isPreview;

                            return (
                              <div
                                key={
                                  video._id ||
                                  video.id ||
                                  videoIndex
                                }
                                className="group flex items-center gap-4 p-4 transition hover:bg-white/[0.03] sm:p-5"
                              >
                                {/* ICON */}
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                    isLocked
                                      ? "bg-slate-800 text-slate-500"
                                      : "bg-blue-500/10 text-blue-400"
                                  }`}
                                >
                                  {isLocked ? (
                                    <Lock size={17} />
                                  ) : (
                                    <PlayCircle size={19} />
                                  )}
                                </div>

                                {/* INFO */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4
                                      className={`text-sm font-semibold ${
                                        isLocked
                                          ? "text-slate-500"
                                          : "text-slate-200"
                                      }`}
                                    >
                                      {videoIndex + 1}.{" "}
                                      {video.title}
                                    </h4>

                                    {isPreview && (
                                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                        Preview
                                      </span>
                                    )}

                                    {isLocked && (
                                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Locked
                                      </span>
                                    )}
                                  </div>

                                  {video.duration && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatDuration(
                                        video.duration
                                      )}
                                    </p>
                                  )}
                                </div>

                                {/* ACTION */}
                                {isPreview ? (
                                  <Link
                                    to={`/courses/${course.slug}/watch/${
                                      video._id ||
                                      video.id
                                    }`}
                                    className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 sm:px-4"
                                  >
                                    <PlayCircle size={15} />

                                    <span>
                                      Watch Preview
                                    </span>
                                  </Link>
                                ) : (
                                  <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/5 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600">
                                    <Lock size={14} />

                                    <span className="hidden sm:inline">
                                      Locked
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mt-14 overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black sm:text-3xl">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Start your learning journey with structured
            modules, practical lessons and progress
            tracking.
          </p>

          <button
            type="button"
            className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            Get Started
          </button>
        </section>
      </main>
    </div>
  );
}