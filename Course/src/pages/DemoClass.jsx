import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, Lock, Payment, School, X } from "@mui/icons-material";
import CoursePlayerLayout from "../layouts/CoursePlayerLayout";
import { COURSE_ROUTES } from "../constants/config";
import { getCourseBySlug, normalizeCourse } from "../services/course.service";

const getId = (value) => value?._id || value?.id || "";

const buildDemoModules = (modules = []) =>
  modules.map((module) => {
    const videos = Array.isArray(module?.videos) ? module.videos : [];

    return {
      ...module,
      videos: videos.map((video, index) => ({
        ...video,
        // Guest demo rule: only the first published video of every module is playable.
        isPreview: index === 0,
        isLocked: index !== 0,
        isCompleted: false,
      })),
    };
  });

export default function DemoClass() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDemo = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getCourseBySlug(slug);
        if (!mounted) return;

        const courseData = normalizeCourse(result?.course);
        const demoModules = buildDemoModules(result?.modules);
        const firstPlayableVideo = demoModules
          .flatMap((module) => module.videos || [])
          .find((video) => !video.isLocked);

        if (!courseData) throw new Error("Course information could not be loaded.");
        if (!firstPlayableVideo) throw new Error("No demo lessons are currently available.");

        setCourse(courseData);
        setModules(demoModules);
        setCurrentVideo(firstPlayableVideo);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load the demo class."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (slug) loadDemo();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (loading || error || !currentVideo) return undefined;

    const timer = window.setTimeout(() => {
      setPaymentOpen(true);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [loading, error, currentVideo]);

  const totalDemoVideos = useMemo(
    () =>
      modules.reduce(
        (total, module) =>
          total + (Array.isArray(module?.videos) ? module.videos.length : 0),
        0
      ),
    [modules]
  );

  const handleSelectVideo = (video) => {
    if (!video || video.isLocked) return;
    setCurrentVideo(video);
  };

  const handleBack = () => navigate(COURSE_ROUTES.DETAILS(slug));
  const handlePayment = () => {
    setPaymentOpen(false);
    navigate(COURSE_ROUTES.DETAILS(slug));
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#0b1220",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: "#60a5fa" }} />
          <Typography sx={{ color: "#cbd5e1" }}>
            Loading demo class...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !course || !currentVideo) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          bgcolor: "#0b1220",
        }}
      >
        <Card sx={{ maxWidth: 520, width: "100%", borderRadius: 4 }}>
          <CardContent sx={{ p: 5, textAlign: "center" }}>
            <School color="primary" sx={{ fontSize: 56 }} />
            <Typography variant="h5" fontWeight={900} sx={{ mt: 2 }}>
              Demo class unavailable
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {error || "No demo lessons are currently available."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ mt: 3, textTransform: "none", fontWeight: 900 }}
            >
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: "#0b1220" }}>
      <CoursePlayerLayout
        course={course}
        courseTitle={course.title}
        modules={modules}
        progress={0}
        currentVideo={currentVideo}
        courseCompleted={false}
        onBack={handleBack}
        onVideoSelect={handleSelectVideo}
      />

      <Dialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            background: "linear-gradient(145deg,#0f172a,#132d4d)",
            border: "1px solid rgba(96,165,250,.35)",
            color: "#fff",
            boxShadow: "0 30px 90px rgba(0,0,0,.55)",
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              background:
                "radial-gradient(circle at top right,rgba(37,99,235,.28),transparent 45%)",
            }}
          >
            <Stack direction="row" justifyContent="flex-end">
              <IconButton
                onClick={() => setPaymentOpen(false)}
                aria-label="Close payment prompt"
                sx={{ color: "#94a3b8" }}
              >
                <X />
              </IconButton>
            </Stack>

            <Box
              sx={{
                width: 62,
                height: 62,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(37,99,235,.18)",
                border: "1px solid rgba(96,165,250,.3)",
                mb: 2,
              }}
            >
              <Lock sx={{ color: "#93c5fd", fontSize: 30 }} />
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 950, lineHeight: 1.15, color: "#fff" }}
            >
              Enjoying the demo?
            </Typography>
            <Typography
              sx={{ mt: 1.2, color: "#b6c4d6", lineHeight: 1.7 }}
            >
              Complete your payment to unlock the complete course, including
              all modules and lessons.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: "#93c5fd", fontWeight: 800 }}
              >
                {modules.length} modules
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                •
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#93c5fd", fontWeight: 800 }}
              >
                {totalDemoVideos} lessons
              </Typography>
            </Stack>

            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<Payment />}
              onClick={handlePayment}
              sx={{
                mt: 2.5,
                py: 1.35,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 950,
                background: "linear-gradient(135deg,#0875ff,#1d8cff)",
                boxShadow: "0 14px 30px rgba(14,116,255,.3)",
              }}
            >
              Complete Your Payment
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
