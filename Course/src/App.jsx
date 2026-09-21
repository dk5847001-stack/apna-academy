import { useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import DemoClass from "./pages/DemoClass";
import CoursePlayerLayout from "./layouts/CoursePlayerLayout";
import Certificate from "./pages/Certificate";
import CertificateVerify from "./pages/CertificateVerify";
import Assessment from "./pages/Assessment";
import { COURSE_ROUTES, FRONTEND_URL } from "./constants/config";
import { getCourseBySlug } from "./services/course.service";
import { getLearningCourse, normalizeLearningCourse, normalizeLearningVideo } from "./services/learning.service";
import { completeVideoLesson } from "./services/progress.service";

const getVideoId = (video) => {
  if (!video) return "";
  if (typeof video === "string") return video;
  if (typeof video === "object") return video._id || video.id || "";
  return String(video);
};

const getLastWatchedVideoId = (value) => getVideoId(value);
const redirectToLogin = () => {
  const returnUrl = window.location.origin + window.location.pathname + window.location.search + window.location.hash;
  window.location.assign(FRONTEND_URL + "/login?redirect=" + encodeURIComponent(returnUrl));
};

function CourseLearningPage() {
  const { slug, videoId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [access, setAccess] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const courseResult = await getCourseBySlug(slug);
        if (!mounted) return;

        const courseData = courseResult?.course;
        const courseId = courseData?._id || courseData?.id;
        if (!courseData || !courseId) throw new Error("Course information could not be loaded.");

        const learningResult = await getLearningCourse(courseId);
        if (!mounted) return;

        const normalized = normalizeLearningCourse(learningResult);
        if (!normalized?.access?.isPurchased) {
          navigate(COURSE_ROUTES.DETAILS(slug), {
            replace: true,
            state: { message: "Please enroll in this course to start learning." },
          });
          return;
        }

        const availableModules = normalized.modules || [];
        const videos = availableModules.flatMap((module) =>
          Array.isArray(module?.videos) ? module.videos : []
        );
        const unlockedVideos = videos.filter((video) => !video?.isLocked);

        if (unlockedVideos.length === 0) throw new Error("No unlocked lessons are currently available.");

        const requestedVideo = videoId
          ? videos.find((video) => String(getVideoId(video)) === String(videoId))
          : null;

        let selected = requestedVideo && !requestedVideo.isLocked ? requestedVideo : null;

        if (!selected) {
          const lastId = getLastWatchedVideoId(normalized.progress?.lastWatchedVideo);
          if (lastId) {
            selected = unlockedVideos.find(
              (video) => String(getVideoId(video)) === String(lastId)
            ) || null;
          }
        }

        if (!selected) selected = unlockedVideos[0];

        setCourse(normalized.course || courseData);
        setModules(availableModules);
        setAccess(normalized.access || null);
        setProgress(normalized.progress || null);
        setCurrentVideo(normalizeLearningVideo({ video: selected }));

        if (videoId && String(getVideoId(selected)) !== String(videoId)) {
          window.history.replaceState(
            window.history.state,
            "",
            COURSE_ROUTES.VIDEO(slug, getVideoId(selected))
          );
        }
      } catch (err) {
        console.error("Learning page error:", err);
        if (!mounted) return;
        if (err?.response?.status === 401) {
          redirectToLogin();
          return;
        }
        setError(err?.response?.data?.message || err?.message || "Unable to load your course.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (slug) load();

    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  // Lesson clicks intentionally stay inside the mounted learning page. The
  // URL is managed with the History API so React Router does not remount the
  // route and trigger the full course loader again. Popstate keeps browser
  // Back/Forward working for lesson-to-lesson navigation.
  useEffect(() => {
    if (!slug || modules.length === 0) return undefined;

    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/courses\/([^/]+)\/learn\/([^/]+)\/?$/);
      if (!match) return;

      const pathSlug = decodeURIComponent(match[1]);
      const pathVideoId = decodeURIComponent(match[2]);
      if (pathSlug !== slug) return;

      const videos = modules.flatMap((module) =>
        Array.isArray(module?.videos) ? module.videos : []
      );

      const selected = videos.find(
        (video) => String(getVideoId(video)) === String(pathVideoId) && !video?.isLocked
      );

      if (selected) {
        setCurrentVideo(normalizeLearningVideo({ video: selected }));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [slug, modules]);

  const handleProgressUpdated = useCallback((updatedProgress) => {
    if (!updatedProgress) return;

    setProgress(updatedProgress);

    const completedIds = new Set(
      Array.isArray(updatedProgress.completedVideos)
        ? updatedProgress.completedVideos
            .map((item) => getVideoId(item))
            .filter(Boolean)
            .map(String)
        : []
    );

    setModules((previous) =>
      previous.map((module) => ({
        ...module,
        videos: Array.isArray(module?.videos)
          ? module.videos.map((video) => ({
              ...video,
              isCompleted: completedIds.has(String(getVideoId(video))),
            }))
          : [],
      }))
    );

    setCurrentVideo((previous) =>
      previous
        ? {
            ...previous,
            isCompleted: completedIds.has(String(getVideoId(previous))),
          }
        : previous
    );
  }, []);

  const completingVideoIdRef = useRef("");

  const selectLesson = useCallback(
    async (video) => {
      if (!video || video.isLocked) return;

      const id = getVideoId(video);
      if (!id || !slug) return;

      if (completingVideoIdRef.current === String(id)) return;

      completingVideoIdRef.current = String(id);

      try {
        // Completion is intentionally tied to lesson selection/click.
        // The backend is authoritative and also validates purchase/module access.
        const updatedProgress = await completeVideoLesson({
          courseId: course?._id || course?.id || "",
          videoId: id,
        });

        handleProgressUpdated(updatedProgress);

        setCurrentVideo(
          normalizeLearningVideo({
            video: {
              ...video,
              isCompleted: true,
            },
          })
        );

        // Keep lesson navigation client-side without remounting the whole page.
        window.history.pushState(
          window.history.state,
          "",
          COURSE_ROUTES.VIDEO(slug, id)
        );
      } catch (err) {
        console.error("Unable to complete lesson:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to mark this lesson as completed. Please try again."
        );
      } finally {
        completingVideoIdRef.current = "";
      }
    },
    [course, handleProgressUpdated, slug]
  );

  const handleVideoSelect = useCallback((video) => selectLesson(video), [selectLesson]);
  const handlePrevious = useCallback((video) => selectLesson(video), [selectLesson]);
  const handleNext = useCallback((video) => selectLesson(video), [selectLesson]);
  const handleBack = useCallback(() => navigate(COURSE_ROUTES.DETAILS(slug)), [navigate, slug]);
  const handleAssessment = useCallback(() => navigate(COURSE_ROUTES.ASSESSMENT(slug)), [navigate, slug]);
  const handleCertificate = useCallback(() => navigate(COURSE_ROUTES.CERTIFICATE(slug)), [navigate, slug]);
  const courseCompleted = Boolean(
    progress?.isCompleted === true || Number(progress?.overallProgress) >= 100
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading your course...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Stack spacing={2} maxWidth={520} width="100%">
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
          <Button
            variant="contained"
            onClick={() => navigate(COURSE_ROUTES.DETAILS(slug))}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 800 }}
          >
            Back to Course
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <CoursePlayerLayout
      course={course}
      courseTitle={course?.title || ""}
      courseId={course?._id || course?.id || ""}
      modules={modules}
      access={access}
      progress={progress?.overallProgress || 0}
      currentVideo={currentVideo}
      courseCompleted={courseCompleted}
      onAssessment={handleAssessment}
      onCertificate={handleCertificate}
      onBack={handleBack}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onVideoSelect={handleVideoSelect}
    />
  );
}

function NotFound() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 3 }}>
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography sx={{ fontSize: "4rem", fontWeight: 900, color: "primary.main" }}>404</Typography>
        <Typography variant="h5" fontWeight={900}>Page not found</Typography>
        <Typography color="text.secondary">The page you are looking for does not exist.</Typography>
      </Stack>
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Courses />} />
      <Route path="/courses/:slug" element={<CourseDetails />} />
      <Route path="/courses/:slug/demo" element={<DemoClass />} />
      <Route path="/courses/:slug/learn/:videoId?" element={<CourseLearningPage />} />
      <Route path="/courses/:slug/assessment" element={<Assessment />} />
      <Route path="/courses/:slug/certificate" element={<Certificate />} />
      <Route path="/certificate/verify/:certificateId" element={<CertificateVerify />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
