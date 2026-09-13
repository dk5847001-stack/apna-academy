import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AutoAwesome,
  CheckCircle,
  Lock,
  MenuBook,
  PlayArrow,
  Schedule,
  School,
  Person,
  VideoLibrary,
} from "@mui/icons-material";

import api from "../services/api";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=85";

const FALLBACK_COURSE_THUMBNAIL =
  "https://placehold.co/1600x900/0f172a/ffffff?text=ApnaAcademy";

function formatDuration(seconds) {
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
}

function formatPrice(price) {
  if (
    price === undefined ||
    price === null ||
    price === ""
  ) {
    return "₹1";
  }

  const numericPrice = Number(price);

  if (numericPrice <= 0) {
    return "Free";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
}

function formatLevel(level) {
  if (!level) {
    return "";
  }

  return String(level)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function getVideoId(video) {
  return video?._id || video?.id;
}

export default function CourseDetails() {
  const { slug } = useParams();

  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/courses/${slug}`
        );

        console.log(
          "COURSE DETAILS API:",
          response.data
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to load course."
          );
        }

        const apiData = response.data.data;

        /*
         * Backend response compatibility:
         *
         * 1. data = course object
         *
         * 2. data = {
         *      course: {...},
         *      modules: [...]
         *    }
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

        if (isMounted) {
          setCourse(courseData);
        }
      } catch (err) {
        console.error(
          "Course details error:",
          err
        );

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load course details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchCourse();
    } else {
      setLoading(false);
      setError("Invalid course URL.");
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen overflow-hidden bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <Skeleton
            variant="rounded"
            animation="wave"
            width={150}
            height={24}
            className="!mb-7 !bg-white/[0.07]"
          />

          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">

            {/* Main skeleton */}
            <div>

              <Skeleton
                variant="rounded"
                animation="wave"
                className="
                  !aspect-video
                  !h-auto
                  !w-full
                  !bg-white/[0.07]
                "
              />

              <div className="mt-7 space-y-4">

                <div className="flex gap-2">
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={110}
                    height={28}
                    className="!bg-white/[0.07]"
                  />

                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={85}
                    height={28}
                    className="!bg-white/[0.07]"
                  />
                </div>

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width="75%"
                  height={48}
                  className="!bg-white/[0.07]"
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width="100%"
                  height={18}
                  className="!bg-white/[0.07]"
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width="85%"
                  height={18}
                  className="!bg-white/[0.07]"
                />

              </div>

            </div>

            {/* Purchase skeleton */}
            <Skeleton
              variant="rounded"
              animation="wave"
              className="
                !h-[420px]
                !w-full
                !bg-white/[0.07]
              "
            />

          </div>

        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">

        <Paper
          elevation={0}
          className="
            !w-full
            !max-w-lg
            !rounded-[1.75rem]
            !border
            !border-red-400/10
            !bg-white/[0.035]
            !p-8
            !text-center
            !shadow-2xl
            !backdrop-blur-xl
          "
        >

          <Box
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-red-400/10
              bg-red-400/10
              text-red-300
            "
          >
            <MenuBook fontSize="large" />
          </Box>

          <Typography
            component="h1"
            className="
              !mt-5
              !text-2xl
              !font-black
              !text-white
            "
          >
            Course Not Found
          </Typography>

          <Typography
            component="p"
            className="
              !mt-3
              !text-sm
              !leading-6
              !text-slate-400
            "
          >
            {error ||
              "The requested course could not be found."}
          </Typography>

          <Button
            component={Link}
            to="/courses"
            variant="contained"
            startIcon={<ArrowBack />}
            className="
              !mt-6
              !rounded-xl
              !bg-gradient-to-r
              !from-cyan-400
              !to-blue-500
              !px-5
              !py-3
              !font-bold
              !normal-case
              !text-slate-950
            "
          >
            Back to Courses
          </Button>

        </Paper>

      </div>
    );
  }

  /* ============================================================
     COURSE DATA
  ============================================================ */

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

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[130px]" />

      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ======================================================
            BACK TO COURSES
        ====================================================== */}

        <Button
          component={Link}
          to="/courses"
          variant="text"
          startIcon={<ArrowBack />}
          className="
            !mb-7
            !rounded-xl
            !px-3
            !py-2
            !text-sm
            !font-semibold
            !normal-case
            !text-slate-400
            hover:!bg-white/5
            hover:!text-white
          "
        >
          Back to Courses
        </Button>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">

          {/* ====================================================
              LEFT CONTENT
          ==================================================== */}

          <div>

            {/* ==================================================
                THUMBNAIL
            ================================================== */}

            <div
              className="
                group
                relative
                overflow-hidden
                rounded-[1.75rem]
                border
                border-white/10
                bg-slate-900
                shadow-2xl
              "
            >

              <img
                src={
                  course.thumbnail ||
                  FALLBACK_THUMBNAIL
                }
                alt={
                  course.title ||
                  "Course thumbnail"
                }
                className="
                  h-64
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.02]
                  sm:h-80
                  lg:h-[390px]
                "
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    FALLBACK_COURSE_THUMBNAIL;
                }}
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-slate-950/90
                  via-slate-950/10
                  to-transparent
                "
              />

              {/* Featured */}
              {course.isFeatured && (
                <div className="absolute left-5 top-5">

                  <Chip
                    icon={
                      <AutoAwesome fontSize="small" />
                    }
                    label="Featured Course"
                    size="small"
                    className="
                      !border-amber-300/20
                      !bg-slate-950/75
                      !font-semibold
                      !text-amber-200
                      !backdrop-blur-md
                    "
                    variant="outlined"
                  />

                </div>
              )}

            </div>

            {/* ==================================================
                COURSE INFORMATION
            ================================================== */}

            <div className="mt-7">

              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">

                {course.category && (
                  <Chip
                    label={course.category}
                    size="small"
                    className="
                      !border-cyan-400/15
                      !bg-cyan-400/10
                      !font-semibold
                      !text-cyan-300
                    "
                  />
                )}

                {course.level && (
                  <Chip
                    label={formatLevel(course.level)}
                    size="small"
                    className="
                      !border-white/10
                      !bg-white/5
                      !font-semibold
                      !text-slate-300
                    "
                  />
                )}

                {course.language && (
                  <Chip
                    label={course.language}
                    size="small"
                    className="
                      !border-white/10
                      !bg-white/5
                      !font-semibold
                      !text-slate-300
                    "
                  />
                )}

              </div>

              {/* Title */}
              <Typography
                component="h1"
                className="
                  !text-3xl
                  !font-black
                  !leading-tight
                  !tracking-tight
                  !text-white
                  sm:!text-4xl
                  lg:!text-5xl
                "
              >
                {course.title || "Course"}
              </Typography>

              {/* Short description */}
              {course.shortDescription && (
                <Typography
                  component="p"
                  className="
                    !mt-5
                    !max-w-3xl
                    !text-base
                    !leading-7
                    !text-slate-400
                    sm:!text-lg
                  "
                >
                  {course.shortDescription}
                </Typography>
              )}

              {/* =================================================
                  STATS
              ================================================= */}

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  gap-x-7
                  gap-y-4
                  border-y
                  border-white/10
                  py-5
                "
              >

                {/* Modules */}
                <div className="flex items-center gap-2">

                  <MenuBook
                    fontSize="small"
                    className="!text-cyan-400"
                  />

                  <Typography
                    component="span"
                    className="!text-sm !font-medium !text-slate-300"
                  >
                    {modules.length}{" "}
                    {modules.length === 1
                      ? "Module"
                      : "Modules"}
                  </Typography>

                </div>

                {/* Videos */}
                <div className="flex items-center gap-2">

                  <VideoLibrary
                    fontSize="small"
                    className="!text-cyan-400"
                  />

                  <Typography
                    component="span"
                    className="!text-sm !font-medium !text-slate-300"
                  >
                    {totalVideos}{" "}
                    {totalVideos === 1
                      ? "Video"
                      : "Videos"}
                  </Typography>

                </div>

                {/* Duration */}
                {course.durationDays && (
                  <div className="flex items-center gap-2">

                    <Schedule
                      fontSize="small"
                      className="!text-cyan-400"
                    />

                    <Typography
                      component="span"
                      className="!text-sm !font-medium !text-slate-300"
                    >
                      {course.durationDays} Days
                    </Typography>

                  </div>
                )}

                {/* Instructor */}
                {course.instructor?.name && (
                  <div className="flex items-center gap-2">

                    <Person
                      fontSize="small"
                      className="!text-cyan-400"
                    />

                    <Typography
                      component="span"
                      className="!text-sm !font-medium !text-slate-300"
                    >
                      {course.instructor.name}
                    </Typography>

                  </div>
                )}

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {course.description && (
                <div className="mt-8">

                  <Typography
                    component="h2"
                    className="
                      !text-2xl
                      !font-black
                      !text-white
                    "
                  >
                    About this course
                  </Typography>

                  <Typography
                    component="div"
                    className="
                      mt-4
                      whitespace-pre-line
                      !text-sm
                      !leading-7
                      !text-slate-400
                      sm:!text-base
                    "
                  >
                    {course.description}
                  </Typography>

                </div>
              )}

            </div>

          </div>

          {/* ====================================================
              PURCHASE CARD
          ==================================================== */}

          <aside className="lg:sticky lg:top-8 lg:self-start">

            <Paper
              elevation={0}
              className="
                !overflow-hidden
                !rounded-[1.75rem]
                !border
                !border-white/10
                !bg-white/[0.035]
                !p-6
                !shadow-2xl
                !backdrop-blur-xl
                sm:!p-7
              "
            >

              {/* Price */}
              <Typography
                component="p"
                className="!text-sm !font-medium !text-slate-500"
              >
                Course Price
              </Typography>

              <Typography
                component="div"
                className="
                  !mt-2
                  !text-4xl
                  !font-black
                  !tracking-tight
                  !text-white
                "
              >
                {formatPrice(course.price)}
              </Typography>

              <Typography
                component="p"
                className="
                  !mt-3
                  !text-sm
                  !leading-6
                  !text-slate-400
                "
              >
                Purchase this course to unlock your
                structured learning journey and access
                protected lessons.
              </Typography>

              {/* Enroll */}
              <Button
                type="button"
                fullWidth
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                className="
                  !mt-6
                  !min-h-14
                  !rounded-2xl
                  !bg-gradient-to-r
                  !from-cyan-400
                  !to-blue-500
                  !text-sm
                  !font-black
                  !normal-case
                  !text-slate-950
                  !shadow-lg
                  !shadow-cyan-500/10
                  hover:!from-cyan-300
                  hover:!to-blue-400
                "
              >
                Enroll Now
              </Button>

              {/* Benefits */}
              <div className="mt-6">

                <Divider className="!border-white/10" />

                <div className="space-y-4 pt-5">

                  <div className="flex items-center gap-3">

                    <CheckCircle
                      fontSize="small"
                      className="!text-emerald-400"
                    />

                    <Typography
                      component="span"
                      className="!text-sm !text-slate-300"
                    >
                      Structured modules
                    </Typography>

                  </div>

                  <div className="flex items-center gap-3">

                    <CheckCircle
                      fontSize="small"
                      className="!text-emerald-400"
                    />

                    <Typography
                      component="span"
                      className="!text-sm !text-slate-300"
                    >
                      Progress tracking
                    </Typography>

                  </div>

                  <div className="flex items-center gap-3">

                    <CheckCircle
                      fontSize="small"
                      className="!text-emerald-400"
                    />

                    <Typography
                      component="span"
                      className="!text-sm !text-slate-300"
                    >
                      Certificate after completion
                    </Typography>

                  </div>

                  <div className="flex items-center gap-3">

                    <CheckCircle
                      fontSize="small"
                      className="!text-emerald-400"
                    />

                    <Typography
                      component="span"
                      className="!text-sm !text-slate-300"
                    >
                      Protected course lessons
                    </Typography>

                  </div>

                </div>

              </div>

            </Paper>

          </aside>

        </section>

        {/* ======================================================
            CURRICULUM
        ====================================================== */}

        <section className="mt-14">

          <div className="mb-7">

            <div className="flex items-center gap-2">

              <School
                fontSize="small"
                className="!text-cyan-400"
              />

              <Typography
                component="p"
                className="
                  !text-sm
                  !font-bold
                  !uppercase
                  !tracking-[0.2em]
                  !text-cyan-400
                "
              >
                Curriculum
              </Typography>

            </div>

            <Typography
              component="h2"
              className="
                !mt-2
                !text-3xl
                !font-black
                !text-white
              "
            >
              Course Modules
            </Typography>

            <Typography
              component="p"
              className="
                !mt-2
                !max-w-2xl
                !text-sm
                !leading-6
                !text-slate-400
              "
            >
              Preview the first lesson of every module.
              Other lessons remain locked until enrollment.
            </Typography>

          </div>

          {/* ====================================================
              NO MODULES
          ==================================================== */}

          {modules.length === 0 ? (
            <Paper
              elevation={0}
              className="
                !rounded-[1.75rem]
                !border
                !border-white/10
                !bg-white/[0.03]
                !p-10
                !text-center
              "
            >

              <MenuBook
                fontSize="large"
                className="!text-slate-500"
              />

              <Typography
                component="p"
                className="!mt-4 !text-sm !text-slate-400"
              >
                No modules available yet.
              </Typography>

            </Paper>
          ) : (

            /* ==================================================
               MODULE LIST
            ================================================== */

            <div className="space-y-5">

              {modules.map((module, moduleIndex) => {

                const videos = Array.isArray(
                  module.videos
                )
                  ? module.videos
                  : [];

                return (
                  <Paper
                    key={
                      module._id ||
                      module.id ||
                      moduleIndex
                    }
                    elevation={0}
                    className="
                      !overflow-hidden
                      !rounded-[1.75rem]
                      !border
                      !border-white/10
                      !bg-white/[0.025]
                    "
                  >

                    {/* MODULE HEADER */}
                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        border-b
                        border-white/10
                        p-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:p-6
                      "
                    >

                      <div className="flex min-w-0 items-start gap-4">

                        {/* Module Number */}
                        <Box
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-cyan-400/10
                            bg-cyan-400/10
                            text-sm
                            font-black
                            text-cyan-300
                          "
                        >
                          {String(moduleIndex + 1).padStart(
                            2,
                            "0"
                          )}
                        </Box>

                        <div className="min-w-0">

                          <Typography
                            component="h3"
                            className="
                              !text-lg
                              !font-bold
                              !text-white
                            "
                          >
                            {module.title ||
                              `Module ${moduleIndex + 1}`}
                          </Typography>

                          {module.description && (
                            <Typography
                              component="p"
                              className="
                                !mt-1
                                !text-sm
                                !leading-6
                                !text-slate-400
                              "
                            >
                              {module.description}
                            </Typography>
                          )}

                        </div>

                      </div>

                      {/* Video Count */}
                      <Chip
                        icon={
                          <VideoLibrary fontSize="small" />
                        }
                        label={`${videos.length} ${
                          videos.length === 1
                            ? "Video"
                            : "Videos"
                        }`}
                        size="small"
                        className="
                          !w-fit
                          !border-white/10
                          !bg-white/5
                          !text-slate-400
                        "
                        variant="outlined"
                      />

                    </div>

                    {/* ==================================================
                        VIDEOS
                    ================================================== */}

                    <div className="divide-y divide-white/5">

                      {videos.length === 0 ? (

                        <div className="p-5">

                          <Typography
                            component="p"
                            className="!text-sm !text-slate-500"
                          >
                            No videos available.
                          </Typography>

                        </div>

                      ) : (

                        videos.map(
                          (video, videoIndex) => {

                            /*
                             * IMPORTANT:
                             * Backend already decides preview/locked.
                             *
                             * First video of each module is
                             * also treated as preview for
                             * backward compatibility.
                             */

                            const isPreview =
                              video.isPreview === true ||
                              videoIndex === 0;

                            const isLocked =
                              video.isLocked === true ||
                              !isPreview;

                            const videoId =
                              getVideoId(video);

                            return (
                              <div
                                key={
                                  videoId ||
                                  videoIndex
                                }
                                className="
                                  group
                                  flex
                                  items-center
                                  gap-4
                                  p-4
                                  transition
                                  hover:bg-white/[0.025]
                                  sm:p-5
                                "
                              >

                                {/* Video Icon */}
                                <Box
                                  className={`
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${
                                      isLocked
                                        ? "bg-slate-900 text-slate-600"
                                        : "bg-cyan-400/10 text-cyan-300"
                                    }
                                  `}
                                >
                                  {isLocked ? (
                                    <Lock fontSize="small" />
                                  ) : (
                                    <PlayArrow fontSize="small" />
                                  )}
                                </Box>

                                {/* Video Info */}
                                <div className="min-w-0 flex-1">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <Typography
                                      component="h4"
                                      className={`
                                        !text-sm
                                        !font-semibold
                                        ${
                                          isLocked
                                            ? "!text-slate-500"
                                            : "!text-slate-200"
                                        }
                                      `}
                                    >
                                      {videoIndex + 1}.{" "}
                                      {video.title ||
                                        `Video ${
                                          videoIndex + 1
                                        }`}
                                    </Typography>

                                    {isPreview && (
                                      <Chip
                                        label="Preview"
                                        size="small"
                                        className="
                                          !h-6
                                          !bg-emerald-400/10
                                          !text-[10px]
                                          !font-bold
                                          !uppercase
                                          !tracking-wider
                                          !text-emerald-400
                                        "
                                      />
                                    )}

                                    {isLocked && (
                                      <Chip
                                        label="Locked"
                                        size="small"
                                        icon={
                                          <Lock
                                            sx={{
                                              fontSize:
                                                "12px !important",
                                            }}
                                          />
                                        }
                                        className="
                                          !h-6
                                          !bg-slate-900
                                          !text-[10px]
                                          !font-bold
                                          !uppercase
                                          !tracking-wider
                                          !text-slate-600
                                        "
                                      />
                                    )}

                                  </div>

                                  {video.duration && (
                                    <div className="mt-1 flex items-center gap-1">

                                      <Schedule
                                        sx={{
                                          fontSize: 13,
                                        }}
                                        className="!text-slate-600"
                                      />

                                      <Typography
                                        component="span"
                                        className="!text-xs !text-slate-500"
                                      >
                                        {formatDuration(
                                          video.duration
                                        )}
                                      </Typography>

                                    </div>
                                  )}

                                </div>

                                {/* =================================================
                                    VIDEO ACTION
                                ================================================= */}

                                {isPreview && videoId ? (

                                  <Button
                                    component={Link}
                                    to={`/courses/${course.slug}/watch/${videoId}`}
                                    variant="outlined"
                                    startIcon={
                                      <PlayArrow />
                                    }
                                    className="
                                      !min-h-10
                                      !shrink-0
                                      !rounded-xl
                                      !border-cyan-400/20
                                      !bg-cyan-400/5
                                      !px-3
                                      !text-xs
                                      !font-bold
                                      !normal-case
                                      !text-cyan-300
                                      hover:!border-cyan-400/30
                                      hover:!bg-cyan-400/10
                                    "
                                  >
                                    <span className="hidden sm:inline">
                                      Watch Preview
                                    </span>
                                    <span className="sm:hidden">
                                      Watch
                                    </span>
                                  </Button>

                                ) : (

                                  <Box
                                    className="
                                      flex
                                      h-10
                                      shrink-0
                                      items-center
                                      gap-2
                                      rounded-xl
                                      border
                                      border-white/5
                                      bg-slate-900
                                      px-3
                                      text-xs
                                      font-semibold
                                      text-slate-600
                                    "
                                  >
                                    <Lock
                                      sx={{
                                        fontSize: 15,
                                      }}
                                    />

                                    <span className="hidden sm:inline">
                                      Locked
                                    </span>
                                  </Box>

                                )}

                              </div>
                            );
                          }
                        )

                      )}

                    </div>

                  </Paper>
                );
              })}

            </div>
          )}

        </section>

        {/* ======================================================
            BOTTOM CTA
        ====================================================== */}

        <section
          className="
            mt-14
            overflow-hidden
            rounded-[1.75rem]
            border
            border-cyan-400/10
            bg-gradient-to-br
            from-cyan-400/[0.08]
            via-blue-500/[0.05]
            to-violet-500/[0.08]
            p-8
            text-center
            shadow-2xl
            backdrop-blur-xl
            sm:p-12
          "
        >

          <div className="mx-auto max-w-2xl">

            <div className="flex items-center justify-center gap-2">

              <AutoAwesome
                fontSize="small"
                className="!text-cyan-400"
              />

              <Typography
                component="span"
                className="!text-sm !font-bold !text-cyan-300"
              >
                Start Learning
              </Typography>

            </div>

            <Typography
              component="h2"
              className="
                !mt-3
                !text-2xl
                !font-black
                !text-white
                sm:!text-3xl
              "
            >
              Ready to start learning?
            </Typography>

            <Typography
              component="p"
              className="
                !mx-auto
                !mt-3
                !max-w-xl
                !text-sm
                !leading-6
                !text-slate-400
              "
            >
              Start your learning journey with structured
              modules, practical lessons and progress
              tracking.
            </Typography>

            <Button
              component={Link}
              to="/courses"
              variant="contained"
              startIcon={<ArrowBack />}
              className="
                !mt-6
                !rounded-xl
                !bg-white
                !px-6
                !py-3
                !text-sm
                !font-bold
                !normal-case
                !text-slate-950
                hover:!bg-slate-200
              "
            >
              Explore More Courses
            </Button>

          </div>

        </section>

      </main>

    </div>
  );
}

/*
 * Kept as a local alias so the CTA button remains
 * readable without importing another icon separately.
 */
function ArrowForwardIcon() {
  return <PlayArrow fontSize="small" />;
}