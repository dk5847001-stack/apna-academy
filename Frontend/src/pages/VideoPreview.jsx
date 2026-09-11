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
  Book,
  CheckCircle,
  Lock,
  PlayArrow,
  Schedule,
  VideoLibrary,
} from "@mui/icons-material";

import api from "../services/api";

const FALLBACK_THUMBNAIL =
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

  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function VideoPreview() {
  const { slug, videoId } = useParams();

  const [course, setCourse] = useState(null);

  const [video, setVideo] = useState(null);

  const [module, setModule] = useState(null);

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

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to load course."
          );
        }

        const apiData = response.data.data;

        /*
         * Backend compatibility:
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

        let foundVideo = null;
        let foundModule = null;

        for (const currentModule of
          courseData?.modules || []) {
          const currentVideo = (
            currentModule?.videos || []
          ).find(
            (item) =>
              String(item?._id || item?.id) ===
              String(videoId)
          );

          if (currentVideo) {
            foundVideo = currentVideo;
            foundModule = currentModule;
            break;
          }
        }

        if (!foundVideo) {
          throw new Error("Video not found.");
        }

        /*
         * IMPORTANT:
         * Never trust frontend UI for locked content.
         *
         * Backend should already mark protected videos
         * as locked and should avoid exposing their
         * actual video source.
         */

        if (foundVideo.isLocked) {
          throw new Error(
            "This video is locked. Please enroll in the course to continue."
          );
        }

        if (isMounted) {
          setCourse(courseData);
          setVideo(foundVideo);
          setModule(foundModule);
        }
      } catch (err) {
        console.error(
          "Preview video error:",
          err
        );

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load preview video."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug && videoId) {
      fetchCourse();
    } else {
      setLoading(false);
      setError("Invalid video URL.");
    }

    return () => {
      isMounted = false;
    };
  }, [slug, videoId]);

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          <Skeleton
            variant="rounded"
            animation="wave"
            width={150}
            height={24}
            className="
              !mb-6
              !bg-white/[0.07]
            "
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            className="
              !aspect-video
              !h-auto
              !w-full
              !rounded-[1.75rem]
              !bg-white/[0.07]
            "
          />

          <div className="mt-7">

            <div className="flex gap-2">

              <Skeleton
                variant="rounded"
                animation="wave"
                width={130}
                height={28}
                className="!bg-white/[0.07]"
              />

              <Skeleton
                variant="rounded"
                animation="wave"
                width={110}
                height={28}
                className="!bg-white/[0.07]"
              />

            </div>

            <Skeleton
              variant="rounded"
              animation="wave"
              width="70%"
              height={45}
              className="
                !mt-4
                !bg-white/[0.07]
              "
            />

            <Skeleton
              variant="rounded"
              animation="wave"
              width="100%"
              height={18}
              className="
                !mt-4
                !bg-white/[0.07]
              "
            />

            <Skeleton
              variant="rounded"
              animation="wave"
              width="82%"
              height={18}
              className="
                !mt-2
                !bg-white/[0.07]
              "
            />

          </div>

        </main>
      </div>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error || !video || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">

        <Paper
          elevation={0}
          className="
            !w-full
            !max-w-lg
            !rounded-[1.75rem]
            !border
            !border-white/10
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
            {error?.toLowerCase().includes("locked") ? (
              <Lock fontSize="large" />
            ) : (
              <VideoLibrary fontSize="large" />
            )}
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
            {error?.toLowerCase().includes("locked")
              ? "Video Locked"
              : "Preview Unavailable"}
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
              "This video is currently unavailable."}
          </Typography>

          <Button
            component={Link}
            to={`/courses/${slug}`}
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
              hover:!from-cyan-300
              hover:!to-blue-400
            "
          >
            Back to Course
          </Button>

        </Paper>

      </div>
    );
  }

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-48 -top-40 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute -bottom-48 -right-40 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[130px]" />

      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">

        {/* ======================================================
            BACK TO COURSE
        ====================================================== */}

        <Button
          component={Link}
          to={`/courses/${slug}`}
          variant="text"
          startIcon={<ArrowBack />}
          className="
            !mb-6
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
          Back to Course
        </Button>

        {/* ======================================================
            VIDEO PLAYER
        ====================================================== */}

        <Paper
          elevation={0}
          className="
            !overflow-hidden
            !rounded-[1.75rem]
            !border
            !border-white/10
            !bg-black
            !shadow-2xl
            !shadow-cyan-950/20
          "
        >

          {video.videoUrl ? (
            <video
              className="
                aspect-video
                w-full
                bg-black
                object-contain
              "
              controls
              controlsList="nodownload"
              poster={
                video.thumbnailUrl ||
                course.thumbnail ||
                FALLBACK_THUMBNAIL
              }
              preload="metadata"
              playsInline
              onContextMenu={(event) =>
                event.preventDefault()
              }
            >
              <source
                src={video.videoUrl}
                type="video/mp4"
              />

              Your browser does not support
              HTML5 video.
            </video>
          ) : (
            <div
              className="
                flex
                aspect-video
                items-center
                justify-center
                bg-slate-900
              "
            >
              <div className="px-6 text-center">

                <Box
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-white/5
                    text-slate-600
                  "
                >
                  <PlayArrow fontSize="large" />
                </Box>

                <Typography
                  component="p"
                  className="
                    !mt-4
                    !text-sm
                    !text-slate-500
                  "
                >
                  Video source is not available yet.
                </Typography>

              </div>
            </div>
          )}

        </Paper>

        {/* ======================================================
            VIDEO INFORMATION
        ====================================================== */}

        <section className="mt-7">

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">

            <Chip
              icon={<CheckCircle fontSize="small" />}
              label="Preview Lesson"
              size="small"
              className="
                !border-emerald-400/20
                !bg-emerald-400/10
                !font-bold
                !text-emerald-400
              "
              variant="outlined"
            />

            {module?.title && (
              <Chip
                label={module.title}
                size="small"
                className="
                  !border-white/10
                  !bg-white/5
                  !font-semibold
                  !text-slate-400
                "
                variant="outlined"
              />
            )}

          </div>

          {/* Title */}
          <Typography
            component="h1"
            className="
              !mt-4
              !text-2xl
              !font-black
              !leading-tight
              !tracking-tight
              !text-white
              sm:!text-3xl
              lg:!text-4xl
            "
          >
            {video.title || "Preview Lesson"}
          </Typography>

          {/* Description */}
          {video.description && (
            <Typography
              component="p"
              className="
                !mt-4
                !max-w-4xl
                !text-sm
                !leading-7
                !text-slate-400
                sm:!text-base
              "
            >
              {video.description}
            </Typography>
          )}

          {/* ====================================================
              VIDEO META
          ==================================================== */}

          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-x-7
              gap-y-4
              border-y
              border-white/10
              py-5
            "
          >

            {module?.title && (
              <div className="flex items-center gap-2">

                <Book
                  fontSize="small"
                  className="!text-cyan-400"
                />

                <Typography
                  component="span"
                  className="
                    !text-sm
                    !font-medium
                    !text-slate-400
                  "
                >
                  {module.title}
                </Typography>

              </div>
            )}

            {video.duration && (
              <div className="flex items-center gap-2">

                <Schedule
                  fontSize="small"
                  className="!text-cyan-400"
                />

                <Typography
                  component="span"
                  className="
                    !text-sm
                    !font-medium
                    !text-slate-400
                  "
                >
                  {formatDuration(
                    video.duration
                  )}
                </Typography>

              </div>
            )}

            <div className="flex items-center gap-2">

              <VideoLibrary
                fontSize="small"
                className="!text-cyan-400"
              />

              <Typography
                component="span"
                className="
                  !text-sm
                  !font-medium
                  !text-slate-400
                "
              >
                Preview Access
              </Typography>

            </div>

          </div>

        </section>

        {/* ======================================================
            COURSE CTA
        ====================================================== */}

        <section
          className="
            mt-8
            overflow-hidden
            rounded-[1.75rem]
            border
            border-cyan-400/10
            bg-gradient-to-br
            from-cyan-400/[0.08]
            via-blue-500/[0.05]
            to-violet-500/[0.08]
            p-7
            shadow-2xl
            backdrop-blur-xl
            sm:p-9
          "
        >

          <div
            className="
              flex
              flex-col
              gap-6
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <SchoolIcon />

                <Typography
                  component="span"
                  className="
                    !text-xs
                    !font-bold
                    !uppercase
                    !tracking-[0.18em]
                    !text-cyan-300
                  "
                >
                  Continue Learning
                </Typography>

              </div>

              <Typography
                component="h2"
                className="
                  !mt-3
                  !text-xl
                  !font-black
                  !text-white
                  sm:!text-2xl
                "
              >
                Want access to the complete course?
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
                Enroll in{" "}
                <span className="font-semibold text-slate-200">
                  {course.title}
                </span>{" "}
                to unlock the complete learning
                experience.
              </Typography>

            </div>

            <Button
              component={Link}
              to={`/courses/${slug}`}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              className="
                !shrink-0
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
              View Course
            </Button>

          </div>

        </section>

      </main>

    </div>
  );
}

/*
 * Small local icon wrappers keep the JSX readable
 * while using only MUI icons.
 */

function SchoolIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10">
      <VideoLibrary
        sx={{ fontSize: 16 }}
        className="!text-cyan-400"
      />
    </span>
  );
}

function ArrowForwardIcon() {
  return <PlayArrow fontSize="small" />;
}