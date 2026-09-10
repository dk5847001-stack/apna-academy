import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import api from "../services/api";
import { startCoursePayment } from "../services/payment";

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/courses/${slug}`);

        const data = response.data;

        if (data?.course) {
          setCourse(data.course);
          setModules(data.modules || []);
        } else {
          setCourse(data);
          setModules(data?.modules || []);
        }
      } catch (err) {
        console.error("Course fetch error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load this course. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const handleEnroll = async () => {
    setPaymentMessage("");
    setPaymentError("");

    const token = getToken();

    if (!token) {
      navigate("/login", {
        state: {
          message: "Please login to enroll in this course.",
          redirectTo: `/courses/${slug}`,
        },
      });

      return;
    }

    if (!course?._id) {
      setPaymentError("Course information is unavailable.");
      return;
    }

    try {
      setPaymentLoading(true);

      const user = getUser();

      await startCoursePayment({
        courseId: course._id,
        courseTitle: course.title,
        purchaseType: "course",
        user,

        onSuccess: () => {
          setPaymentMessage(
            "Payment successful! Your course access is now active."
          );

          setTimeout(() => {
            navigate(`/courses/${slug}/learn`);
          }, 1200);
        },

        onFailure: (result) => {
          setPaymentError(
            result?.message ||
              "Payment could not be completed. Please try again."
          );
        },
      });
    } catch (err) {
      console.error("Payment error:", err);

      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAllAccess = async () => {
    setPaymentMessage("");
    setPaymentError("");

    const token = getToken();

    if (!token) {
      navigate("/login", {
        state: {
          message: "Please login to unlock all modules.",
          redirectTo: `/courses/${slug}`,
        },
      });

      return;
    }

    if (!course?._id) {
      setPaymentError("Course information is unavailable.");
      return;
    }

    try {
      setPaymentLoading(true);

      const user = getUser();

      await startCoursePayment({
        courseId: course._id,
        courseTitle: course.title,
        purchaseType: "all-access",
        user,

        onSuccess: () => {
          setPaymentMessage(
            "All modules unlocked successfully!"
          );

          setTimeout(() => {
            navigate(`/courses/${slug}/learn`);
          }, 1200);
        },

        onFailure: (result) => {
          setPaymentError(
            result?.message ||
              "All-access payment could not be completed."
          );
        },
      });
    } catch (err) {
      console.error("All-access payment error:", err);

      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start all-access payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setOpenModules((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  };

  const formatDuration = (seconds = 0) => {
    const totalSeconds = Number(seconds) || 0;

    if (!totalSeconds) {
      return "—";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);

    if (minutes < 60) {
      return `${minutes}m ${
        remainingSeconds ? `${remainingSeconds}s` : ""
      }`.trim();
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${
      remainingMinutes ? `${remainingMinutes}m` : ""
    }`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-5 w-32 rounded bg-slate-800" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
            <div>
              <div className="h-12 max-w-3xl rounded bg-slate-800" />
              <div className="mt-5 h-5 max-w-2xl rounded bg-slate-800" />
              <div className="mt-3 h-5 max-w-xl rounded bg-slate-800" />
            </div>

            <div className="h-80 rounded-3xl bg-slate-800" />
          </div>

          <div className="mt-12 h-96 rounded-3xl bg-slate-900" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Lock size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Course unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error || "This course could not be found."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            <ArrowLeft size={17} />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="text-sm font-black tracking-tight">
                ApnaAcademy
              </p>
              <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
                Learn. Build. Grow.
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
          >
            <ArrowLeft size={16} />
            <span>Courses</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.4fr_0.8fr] lg:px-8 lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
                  {course.category || "Development"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {course.level || "All Levels"}
                </span>

                {course.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                    <Sparkles size={12} />
                    Featured
                  </span>
                )}
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {course.title}
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
                {course.shortDescription ||
                  course.description ||
                  "Build practical skills through structured, project-focused learning."}
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={17} className="text-blue-400" />
                  {course.totalModules || modules.length} Modules
                </span>

                <span className="inline-flex items-center gap-2">
                  <PlayCircle size={17} className="text-blue-400" />
                  {course.totalVideos || "Multiple"} Videos
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3 size={17} className="text-blue-400" />
                  {course.durationDays || 30} Days Access
                </span>

                <span className="inline-flex items-center gap-2">
                  <Users size={17} className="text-blue-400" />
                  Practical Learning
                </span>
              </div>

              {course.instructor?.name && (
                <div className="mt-8 flex items-center gap-3">
                  {course.instructor.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-black text-blue-300">
                      {course.instructor.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-500">
                      Instructor
                    </p>
                    <p className="text-sm font-bold text-slate-200">
                      {course.instructor.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Card */}
            <div className="lg:pt-2">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
                {course.thumbnail ? (
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-bold backdrop-blur-md">
                      <ShieldCheck
                        size={15}
                        className="text-emerald-400"
                      />
                      Secure Learning
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-slate-900">
                    <GraduationCap
                      size={64}
                      className="text-blue-400/60"
                    />
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Course Price
                      </p>

                      <p className="mt-1 text-3xl font-black">
                        ₹{Number(course.price || 0).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      Instant Access
                    </span>
                  </div>

                  {paymentMessage && (
                    <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-300">
                      <div className="flex items-start gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                        <span>{paymentMessage}</span>
                      </div>
                    </div>
                  )}

                  {paymentError && (
                    <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-300">
                      {paymentError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={paymentLoading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-black shadow-xl shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Zap size={18} />
                    {paymentLoading
                      ? "Processing..."
                      : "Enroll Now"}
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                      Or
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <button
                    type="button"
                    onClick={handleAllAccess}
                    disabled={paymentLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-3.5 text-sm font-black text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={17} />
                    Unlock All Modules — ₹
                    {Number(
                      course.allAccessPrice || 99
                    ).toLocaleString("en-IN")}
                  </button>

                  <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
                    Secure payment powered by Razorpay. Your
                    course access is activated only after
                    server-side payment verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
                  Curriculum
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Course Curriculum
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Start with the preview lessons and unlock
                  your complete learning journey after
                  enrollment.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {modules.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                    No modules are available yet.
                  </div>
                ) : (
                  modules.map((module, index) => {
                    const moduleId =
                      module._id || module.id || index;

                    const isOpen =
                      !!openModules[moduleId];

                    const videos = module.videos || [];

                    return (
                      <div
                        key={moduleId}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleModule(moduleId)
                          }
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.03] sm:px-5"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-black text-blue-300">
                              {String(
                                module.order || index + 1
                              ).padStart(2, "0")}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-white sm:text-base">
                                {module.title}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {videos.length ||
                                  module.totalVideos ||
                                  0}{" "}
                                lessons
                              </p>
                            </div>
                          </div>

                          <ChevronDown
                            size={19}
                            className={`shrink-0 text-slate-500 transition ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="border-t border-white/5">
                            {videos.length === 0 ? (
                              <div className="px-5 py-4 text-sm text-slate-500">
                                Lessons will be added soon.
                              </div>
                            ) : (
                              videos.map((video, videoIndex) => {
                                const isPreview =
                                  Boolean(video.isPreview);

                                return (
                                  <div
                                    key={
                                      video._id ||
                                      video.id ||
                                      videoIndex
                                    }
                                    className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 last:border-b-0"
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                                        {isPreview ? (
                                          <PlayCircle
                                            size={16}
                                          />
                                        ) : (
                                          <Lock size={15} />
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-300">
                                          {video.title}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-600">
                                          Lesson{" "}
                                          {video.order ||
                                            videoIndex + 1}{" "}
                                          •{" "}
                                          {formatDuration(
                                            video.duration
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {isPreview ? (
                                      <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                        Preview
                                      </span>
                                    ) : (
                                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Benefits */}
            <aside>
              <div className="sticky top-24 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                  Why ApnaAcademy
                </p>

                <h3 className="mt-3 text-xl font-black">
                  Learn with confidence
                </h3>

                <div className="mt-6 space-y-5">
                  {[
                    [
                      ShieldCheck,
                      "Secure course access",
                      "Access is controlled by the backend after verified payment.",
                    ],
                    [
                      PlayCircle,
                      "Practical video lessons",
                      "Learn through structured, focused lessons.",
                    ],
                    [
                      CheckCircle2,
                      "Progress tracking",
                      "Your completed lessons and learning progress stay synced.",
                    ],
                    [
                      GraduationCap,
                      "Certificate",
                      "Complete the required learning journey to become eligible for certification.",
                    ],
                  ].map(
                    ([Icon, title, description]) => (
                      <div
                        key={title}
                        className="flex gap-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                          <Icon size={19} />
                        </div>

                        <div>
                          <h4 className="text-sm font-bold">
                            {title}
                          </h4>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}