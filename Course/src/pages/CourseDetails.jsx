import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AccessTime,
  ArrowBack,
  Bolt,
  Book,
  ExpandMore,
  Lock,
  LocalOffer,
  People,
  PlayCircle,
  School,
  Security,
  ShoppingCart,
  Star,
  Verified,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { COURSE_ROUTES, FRONTEND_URL } from "../constants/config";
import { getCourseBySlug, normalizeCourse } from "../services/course.service";
import api from "../services/api";
import { startCoursePayment, validatePromoCode } from "../services/payment";

const getId = (value) => value?._id || value?.id || "";
const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "A";

const getPreviewVideo = (modules = []) => {
  const videos = modules.flatMap((module) =>
    Array.isArray(module?.videos) ? module.videos : []
  );
  return (
    videos.find(
      (video) =>
        video?.isPreview === true ||
        video?.isDemo === true ||
        video?.preview === true ||
        video?.isFree === true ||
        video?.accessType === "preview" ||
        video?.accessType === "demo"
    ) || videos[0] || null
  );
};

const resolvePreviewUrl = (video, autoplay = true) => {
  const raw = typeof video?.videoUrl === "string" ? video.videoUrl.trim() : "";
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (
      url.hostname === "iframe.mediadelivery.net" ||
      url.hostname === "player.mediadelivery.net"
    ) {
      const parts = url.pathname.split("/").filter(Boolean);
      const playerIndex = parts.findIndex(
        (part) => part === "embed" || part === "play"
      );
      if (playerIndex >= 0 && parts[playerIndex + 1]) {
        parts[playerIndex] = "embed";
        url.hostname = "player.mediadelivery.net";
        url.pathname = `/${parts.join("/")}`;
        url.searchParams.set("autoplay", autoplay ? "true" : "false");
        url.searchParams.set("muted", autoplay ? "false" : "true");
        return url.toString();
      }
    }
    if (
      /\.(mp4|webm|ogg|m3u8)$/i.test(url.pathname) ||
      url.hostname.endsWith("b-cdn.net")
    ) {
      return raw;
    }
  } catch {
    return "";
  }
  return "";
};

const isDirectMedia = (url = "") => {
  try {
    const parsed = new URL(url);
    return (
      /\.(mp4|webm|ogg|m3u8)$/i.test(parsed.pathname) ||
      parsed.hostname.endsWith("b-cdn.net")
    );
  } catch {
    return false;
  }
};

const formatDuration = (seconds = 0) => {
  const value = Number(seconds) || 0;
  if (value <= 0) return "Preview";
  const minutes = Math.floor(value / 60);
  const remaining = Math.floor(value % 60);
  if (minutes < 60) {
    return `${minutes}m${remaining ? ` ${remaining}s` : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins ? ` ${mins}m` : ""}`;
};

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
  const [expandedModule, setExpandedModule] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCourseBySlug(slug);
        if (!mounted) return;
        const normalizedCourse = normalizeCourse(result?.course);
        setCourse(normalizedCourse);
        window.dispatchEvent(
          new CustomEvent("apnaacademy-course-loaded", {
            detail: normalizedCourse,
          })
        );
        setModules(Array.isArray(result?.modules) ? result.modules : []);
        setExpandedModule(null);
        setAppliedPromo(null);
        setPromoCode("");
        setPromoError("");
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this course."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (slug) loadCourse();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const previewVideo = useMemo(() => getPreviewVideo(modules), [modules]);
  const previewUrl = useMemo(
    () => resolvePreviewUrl(previewVideo, true),
    [previewVideo]
  );

  const coursePrice = useMemo(
    () => Math.max(Number(course?.price || 0), 0),
    [course?.price]
  );

  const promoPricing = useMemo(() => {
    if (!appliedPromo?.pricing) return null;

    const originalAmount = Math.max(
      Number(appliedPromo.pricing.originalAmount ?? coursePrice),
      0
    );
    const discountAmount = Math.min(
      Math.max(Number(appliedPromo.pricing.discountAmount || 0), 0),
      originalAmount
    );
    const finalAmount = Math.max(
      Number(appliedPromo.pricing.finalAmount ?? originalAmount - discountAmount),
      0
    );

    return {
      originalAmount,
      discountAmount,
      finalAmount,
    };
  }, [appliedPromo, coursePrice]);

  const displayPrice = promoPricing?.finalAmount ?? coursePrice;
  const getAuthenticatedUser = async () => {
    const response = await api.get("/auth/me");
    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Please login to continue."
      );
    }
    return response.data.data;
  };

  const redirectToLogin = () => {
    window.location.href = `${FRONTEND_URL}/login`;
  };

  const applyPromo = async () => {
    setPromoError("");
    if (promoLoading || paymentLoading) return;

    const code = promoCode.trim();
    const courseId = getId(course);

    if (!code) {
      setAppliedPromo(null);
      setPromoError("Enter a promo code.");
      return;
    }

    if (!courseId) {
      setPromoError("Course information is unavailable.");
      return;
    }

    try {
      setPromoLoading(true);

      try {
        await getAuthenticatedUser();
      } catch (authError) {
        if (authError?.response?.status === 401) {
          redirectToLogin();
          return;
        }
        throw authError;
      }

      const result = await validatePromoCode({
        code,
        courseId,
        amount: Number(course.price || 0),
      });

      if (!result?.success || !result?.data?.valid) {
        throw new Error(
          result?.message || "This promo code could not be applied."
        );
      }

      setAppliedPromo(result.data);
      setPromoCode(result.data?.promo?.code || code.toUpperCase());
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to validate promo code."
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    if (paymentLoading || promoLoading) return;
    setAppliedPromo(null);
    setPromoError("");
    setPromoCode("");
  };

  const startPurchase = async (purchaseType) => {
    setPaymentMessage("");
    setPaymentError("");
    if (paymentLoading) return;
    const courseId = getId(course);
    if (!courseId) {
      setPaymentError("Course information is unavailable.");
      return;
    }
    try {
      setPaymentLoading(true);
      let user;
      try {
        user = await getAuthenticatedUser();
      } catch (authError) {
        if (authError?.response?.status === 401) {
          redirectToLogin();
          return;
        }
        throw authError;
      }
      await startCoursePayment({
        courseId,
        courseTitle: course.title,
        purchaseType,
        promoCode:
          purchaseType === "course"
            ? appliedPromo?.promo?.code || ""
            : "",
        user,
        onSuccess: () => {
          setPaymentLoading(false);
          setPaymentMessage(
            purchaseType === "all-access"
              ? "Payment successful. All modules are now unlocked."
              : "Payment successful. Your course access is now active."
          );
          window.setTimeout(() => {
            navigate(COURSE_ROUTES.LEARN(slug), { replace: true });
          }, 700);
        },
        onFailure: (result) => {
          setPaymentLoading(false);
          setPaymentError(
            result?.message ||
              "Payment could not be completed. Please try again."
          );
        },
      });
    } catch (err) {
      setPaymentLoading(false);
      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start payment."
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#061a35",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: "#60a5fa" }} />
          <Typography sx={{ color: "#cbd5e1" }}>Loading course...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          bgcolor: "#061a35",
        }}
      >
        <Card sx={{ maxWidth: 520, width: "100%", borderRadius: 4 }}>
          <CardContent sx={{ p: 5, textAlign: "center" }}>
            <School color="primary" sx={{ fontSize: 56 }} />
            <Typography variant="h5" fontWeight={900} sx={{ mt: 2 }}>
              Course unavailable
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {error || "This course could not be found."}
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<ArrowBack />}
              sx={{ mt: 3, textTransform: "none", fontWeight: 800 }}
            >
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const totalVideos = modules.reduce(
    (total, module) =>
      total + (Array.isArray(module?.videos) ? module.videos.length : 0),
    0
  );

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", maxWidth: "100%", overflowX: "hidden", bgcolor: "#061a35", color: "#fff" }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "rgba(4,18,38,.94)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(148,163,184,.16)",
        }}
      >
        <Box
          sx={{
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 1.5, sm: 2.5, md: 5 },
            minHeight: { xs: 64, md: 72 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, sm: 2 },
            minWidth: 0,
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.3,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg,#0875ff,#24a8ff)",
                boxShadow: "0 10px 30px rgba(14,116,255,.35)",
              }}
            >
              <School />
            </Box>
            <Box>
              <Typography fontWeight={900} lineHeight={1} sx={{ fontSize: { xs: "0.92rem", sm: "1rem" } }}>
                ApnaAcademy
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: { xs: "none", sm: "block" } }}>
                Learn. Build. Grow.
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            to="/"
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{
              color: "#fff",
              borderColor: "rgba(148,163,184,.35)",
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              minWidth: { xs: "auto", sm: 96 },
              px: { xs: 1.25, sm: 2 },
            }}
          >
            Courses
          </Button>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 1.5, sm: 2.5, md: 5 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0,1.62fr) minmax(350px,.72fr)",
            },
            gap: { xs: 2.5, sm: 3, lg: 5 },
            alignItems: "start",
            minWidth: 0,
            width: "100%",
          }}
        >
          <Box sx={{ minWidth: 0, width: "100%", order: { xs: 2, lg: 1 } }}>
            <Box
              sx={{
                borderRadius: { xs: 3, md: 4 },
                overflow: "hidden",
                border: "1px solid rgba(96,165,250,.38)",
                bgcolor: "#000",
                boxShadow: "0 28px 80px rgba(0,0,0,.35)",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  bgcolor: "#000",
                }}
              >
                {previewUrl ? (
                  isDirectMedia(previewUrl) ? (
                    <Box
                      component="video"
                      src={previewUrl}
                      poster={
                        previewVideo?.thumbnailUrl || course.thumbnail || undefined
                      }
                      autoPlay
                      muted={false}
                      loop
                      playsInline
                      controls
                      preload="auto"
                      aria-label={`${course.title} preview video`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      component="iframe"
                      src={previewUrl}
                      title={previewVideo?.title || `${course.title} preview`}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      sx={{
                        width: "100%",
                        height: "100%",
                        border: 0,
                        display: "block",
                      }}
                    />
                  )
                ) : (
                  <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
                    {course.thumbnail && (
                      <Box
                        component="img"
                        src={course.thumbnail}
                        alt={`${course.title} course thumbnail`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        background:
                          "linear-gradient(180deg,transparent 35%,rgba(0,0,0,.72))",
                      }}
                    >
                      <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                        Preview video is not available yet.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PlayCircle />}
              onClick={() => navigate(`/courses/${encodeURIComponent(slug)}/demo`)}
              disabled={!previewVideo}
              sx={{
                mt: 2,
                py: 1.4,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 900,
                fontSize: "1rem",
                background: "linear-gradient(135deg,#0875ff,#1d8cff)",
                boxShadow: "0 14px 30px rgba(14,116,255,.28)",
              }}
            >
              Watch Demo Class
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 1.5 }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Book />}
                component="a"
                href={course.previewSyllabusPdfUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!course.previewSyllabusPdfUrl}
                sx={{
                  py: 1.25,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 900,
                  color: "#dbeafe",
                  borderColor: "rgba(148,163,184,.5)",
                  "&:hover": { borderColor: "#60a5fa", bgcolor: "rgba(37,99,235,.08)" },
                }}
              >
                Preview Syllabus
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Bolt />}
                component="a"
                href={course.freeResourcesUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!course.freeResourcesUrl}
                sx={{
                  py: 1.25,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 900,
                  color: "#dbeafe",
                  borderColor: "rgba(148,163,184,.5)",
                  "&:hover": { borderColor: "#60a5fa", bgcolor: "rgba(37,99,235,.08)" },
                }}
              >
                Free Resources
              </Button>
            </Stack>

            <Box component="article" sx={{ mt: { xs: 4, md: 5 } }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
                <Chip
                  label={course.category || "Development"}
                  sx={{ bgcolor: "#0875ff", color: "#fff", fontWeight: 800 }}
                />
                <Chip
                  label={course.level || "All Levels"}
                  variant="outlined"
                  sx={{ color: "#cbd5e1", borderColor: "rgba(148,163,184,.4)" }}
                />
                {course.isFeatured && (
                  <Chip
                    icon={<Star />}
                    label="Featured"
                    sx={{ bgcolor: "rgba(234,179,8,.16)", color: "#fde68a" }}
                  />
                )}
              </Stack>

              <Typography
                component="h1"
                sx={{
                  mt: 2.5,
                  fontSize: { xs: "1.85rem", sm: "3rem", md: "4rem" },
                  lineHeight: 1.05,
                  fontWeight: 950,
                  letterSpacing: "-.045em",
                  color: "#f8fafc",
                }}
              >
                {course.title}
              </Typography>

              <Typography
                component="p"
                sx={{
                  mt: 2,
                  color: "#9fb1c7",
                  fontSize: { xs: "1rem", md: "1.12rem" },
                  lineHeight: 1.75,
                  maxWidth: 920,
                }}
              >
                {course.shortDescription ||
                  course.description ||
                  "Build practical skills through structured, project-focused learning."}
              </Typography>

              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                spacing={1.2}
                sx={{ mt: 3 }}
                aria-label="Course overview"
              >
                <Chip
                  icon={<Book />}
                  label={`${course.totalModules || modules.length} Modules`}
                  variant="outlined"
                  sx={{
                    color: "#dbeafe",
                    borderColor: "rgba(96,165,250,.35)",
                    bgcolor: "rgba(15,38,70,.55)",
                  }}
                />
                <Chip
                  icon={<PlayCircle />}
                  label={`${course.totalVideos || totalVideos || "Multiple"} Videos`}
                  variant="outlined"
                  sx={{
                    color: "#dbeafe",
                    borderColor: "rgba(96,165,250,.35)",
                    bgcolor: "rgba(15,38,70,.55)",
                  }}
                />
                <Chip
                  icon={<AccessTime />}
                  label={`${course.durationDays || 30} Days`}
                  variant="outlined"
                  sx={{
                    color: "#dbeafe",
                    borderColor: "rgba(96,165,250,.35)",
                    bgcolor: "rgba(15,38,70,.55)",
                  }}
                />
                <Chip
                  icon={<People />}
                  label="Practical Learning"
                  variant="outlined"
                  sx={{
                    color: "#dbeafe",
                    borderColor: "rgba(96,165,250,.35)",
                    bgcolor: "rgba(15,38,70,.55)",
                  }}
                />
              </Stack>

              {course.instructor?.name && (
                <Paper
                  component="section"
                  aria-label="Course instructor"
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 2,
                    maxWidth: 520,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: "rgba(11,35,64,.75)",
                    border: "1px solid rgba(96,165,250,.22)",
                    borderRadius: 3,
                  }}
                >
                  {course.instructor.avatar ? (
                    <Box
                      component="img"
                      src={course.instructor.avatar}
                      alt={`${course.instructor.name}, course instructor`}
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#1d4ed8",
                        fontWeight: 900,
                        fontSize: 20,
                      }}
                    >
                      {getInitial(course.instructor.name)}
                    </Box>
                  )}
                  <Box>
                    <Typography component="p" variant="caption" sx={{ color: "#7891ad" }}>
                      Instructor
                    </Typography>
                    <Typography component="p" fontWeight={900} sx={{ color: "#fff" }}>
                      {course.instructor.name}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>

            <Box component="section" aria-labelledby="course-curriculum-heading" sx={{ mt: 5 }}>
              <Typography id="course-curriculum-heading" component="h2" variant="h5" fontWeight={900} sx={{ fontSize: { xs: "1.35rem", sm: "1.5rem" } }}>
                Course Curriculum
              </Typography>
              <Typography component="p" sx={{ mt: 0.8, color: "#8ea5c0", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                Explore the modules and preview lessons before enrolling.
              </Typography>

              <Box component="div" sx={{ mt: 2 }}>
                {modules.map((module, index) => {
                  const moduleId = getId(module) || `module-${index}`;
                  const videos = Array.isArray(module?.videos) ? module.videos : [];
                  const expanded = expandedModule === moduleId;
                  const moduleHeadingId = `${moduleId}-heading`;

                  return (
                    <Accordion
                      key={moduleId}
                      component="section"
                      aria-labelledby={moduleHeadingId}
                      expanded={expanded}
                      onChange={() =>
                        setExpandedModule(expanded ? null : moduleId)
                      }
                      disableGutters
                      sx={{
                        mb: 1.25,
                        bgcolor: "#0b2547",
                        color: "#fff",
                        border: "1px solid rgba(96,165,250,.18)",
                        borderRadius: "14px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "#93c5fd" }} />}
                        sx={{
                          px: { xs: 1.5, sm: 2 },
                          "& .MuiAccordionSummary-content": {
                            minWidth: 0,
                            my: { xs: 1.25, sm: 2 },
                          },
                        }}
                        aria-controls={`${moduleId}-content`}
                        id={moduleHeadingId}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography component="h3" fontWeight={900}>
                            {module.title || `Module ${index + 1}`}
                          </Typography>
                          <Typography component="p" variant="caption" sx={{ color: "#7891ad" }}>
                            {videos.length} {videos.length === 1 ? "lesson" : "lessons"}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails
                        id={`${moduleId}-content`}
                        sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}
                      >
                        <Stack spacing={0.8}>
                          {videos.map((video, videoIndex) => {
                            const isPreview =
                              video?.isPreview === true ||
                              video?.isDemo === true ||
                              video?.preview === true ||
                              video?.isFree === true ||
                              videoIndex === 0;

                            return (
                              <Box
                                component="article"
                                key={getId(video) || `${moduleId}-${videoIndex}`}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 2,
                                  p: 1.4,
                                  borderRadius: 2,
                                  bgcolor: "rgba(2,12,28,.45)",
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1.2}
                                  alignItems="center"
                                  minWidth={0}
                                >
                                  {isPreview ? (
                                    <PlayCircle sx={{ color: "#60a5fa" }} aria-hidden="true" />
                                  ) : (
                                    <Lock sx={{ color: "#64748b" }} aria-hidden="true" />
                                  )}
                                  <Typography
                                    component="p"
                                    fontWeight={700}
                                    sx={{
                                      minWidth: 0,
                                      overflowWrap: "anywhere",
                                      wordBreak: "break-word",
                                      whiteSpace: { xs: "normal", sm: "nowrap" },
                                    }}
                                  >
                                    {video.title || `Lesson ${videoIndex + 1}`}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isPreview ? (
                                    <Chip
                                      size="small"
                                      label="Preview"
                                      sx={{
                                        bgcolor: "rgba(34,197,94,.13)",
                                        color: "#86efac",
                                        fontWeight: 800,
                                      }}
                                    />
                                  ) : (
                                    <Lock sx={{ color: "#64748b", fontSize: 18 }} aria-hidden="true" />
                                  )}
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ color: "#7891ad" }}
                                  >
                                    {formatDuration(video.duration)}
                                  </Typography>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Box>
          </Box>

          <Card
            component="aside"
            aria-label="Course enrollment"
            elevation={0}
            sx={{
              position: { lg: "sticky" },
              top: { lg: 92 },
              overflow: "hidden",
              borderRadius: { xs: 3, md: 4 },
              bgcolor: "#0a2342",
              border: "1px solid rgba(96,165,250,.28)",
              boxShadow: "0 28px 70px rgba(0,0,0,.32)",
              minWidth: 0,
              width: "100%",
              order: { xs: 1, lg: 2 },
            }}
          >
            <Box
              sx={{
                position: "relative",
                aspectRatio: "16 / 9",
                overflow: "hidden",
              }}
            >
              {course.thumbnail ? (
                <Box
                  component="img"
                  src={course.thumbnail}
                  alt={`${course.title} course thumbnail`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#102f55",
                  }}
                >
                  <School sx={{ fontSize: 68, color: "#60a5fa" }} aria-hidden="true" />
                </Box>
              )}

              <Box
                sx={{
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,.95)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                }}
              >
                <Security sx={{ color: "#16a34a", fontSize: 18 }} aria-hidden="true" />
                <Typography component="span" variant="caption" fontWeight={900} sx={{ color: "#0f172a" }}>
                  Server-verified access
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography
                component="p"
                variant="caption"
                sx={{ color: "#7f9ab7", fontWeight: 800, letterSpacing: ".08em" }}
              >
                COURSE PRICE
              </Typography>
              {promoPricing ? (
                <Box sx={{ mt: 0.6 }}>
                  <Stack direction="row" spacing={1.2} alignItems="baseline" flexWrap="wrap" useFlexGap>
                    <Typography
                      component="p"
                      sx={{ fontSize: "2.6rem", fontWeight: 950, color: "#fff", lineHeight: 1.05 }}
                    >
                      ₹{displayPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: displayPrice % 1 ? 2 : 0,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography
                      component="p"
                      sx={{ color: "#7891ad", textDecoration: "line-through", fontWeight: 800 }}
                    >
                      ₹{promoPricing.originalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: promoPricing.originalAmount % 1 ? 2 : 0,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Stack>
                  <Typography
                    component="p"
                    variant="caption"
                    sx={{ mt: 0.5, color: "#86efac", fontWeight: 900 }}
                  >
                    You save ₹{promoPricing.discountAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: promoPricing.discountAmount % 1 ? 2 : 0,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  component="p"
                  sx={{ mt: 0.4, fontSize: "2.6rem", fontWeight: 950, color: "#fff" }}
                >
                  ₹{coursePrice.toLocaleString("en-IN")}
                </Typography>
              )}

              {course.originalPrice &&
                Number(course.originalPrice) > Number(course.price || 0) && (
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Typography
                      component="p"
                      sx={{
                        color: "#7891ad",
                        textDecoration: "line-through",
                        fontWeight: 800,
                      }}
                    >
                      ₹{Number(course.originalPrice).toLocaleString("en-IN")}
                    </Typography>
                    <Chip
                      label="Offer"
                      size="small"
                      sx={{ bgcolor: "#16a34a", color: "#fff", fontWeight: 900 }}
                    />
                  </Stack>
                )}

              <Chip
                icon={<Verified />}
                label="Server-verified access"
                size="small"
                sx={{
                  mt: 1.2,
                  bgcolor: "rgba(34,197,94,.14)",
                  color: "#86efac",
                  fontWeight: 800,
                }}
              />

              <Paper
                component="section"
                aria-label="Promo code"
                elevation={0}
                sx={{
                  mt: 2,
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: 2.5,
                  bgcolor: "rgba(2,12,28,.38)",
                  border: "1px solid rgba(96,165,250,.18)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalOffer sx={{ color: "#93c5fd", fontSize: 20 }} />
                  <Typography component="h3" fontWeight={900} sx={{ color: "#fff" }}>
                    Have a promo code?
                  </Typography>
                </Stack>

                {appliedPromo ? (
                  <Box sx={{ mt: 1.5 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      <Chip
                        icon={<LocalOffer />}
                        label={appliedPromo?.promo?.code || "Promo applied"}
                        sx={{
                          alignSelf: { xs: "flex-start", sm: "center" },
                          bgcolor: "rgba(34,197,94,.14)",
                          color: "#86efac",
                          fontWeight: 900,
                        }}
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={removePromo}
                        disabled={paymentLoading || promoLoading}
                        sx={{ textTransform: "none", fontWeight: 800, alignSelf: { xs: "flex-start", sm: "center" } }}
                      >
                        Remove
                      </Button>
                    </Stack>
                    <Typography sx={{ mt: 1.2, color: "#86efac", fontWeight: 800 }}>
                      Promo code validated successfully.
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 0.4, display: "block", color: "#7891ad", lineHeight: 1.6 }}>
                      Discount: ₹{Number(promoPricing?.discountAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · Final: ₹{Number(promoPricing?.finalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "#64748b", lineHeight: 1.5 }}>
                      Final payable amount will be confirmed securely by the server during checkout.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mt: 1.5 }}
                    >
                      <Box
                        component="input"
                        value={promoCode}
                        onChange={(event) => {
                          setPromoCode(event.target.value.toUpperCase());
                          if (promoError) setPromoError("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") applyPromo();
                        }}
                        placeholder="Enter promo code"
                        maxLength={50}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Promo code"
                        disabled={promoLoading || paymentLoading}
                        sx={{
                          minWidth: 0,
                          flex: 1,
                          width: "100%",
                          px: 1.5,
                          py: 1.35,
                          borderRadius: 2,
                          border: "1px solid rgba(148,163,184,.35)",
                          bgcolor: "rgba(2,12,28,.7)",
                          color: "#fff",
                          outline: "none",
                          font: "inherit",
                          "&::placeholder": { color: "#7891ad", opacity: 1 },
                          "&:focus": { borderColor: "#60a5fa" },
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={applyPromo}
                        disabled={promoLoading || paymentLoading || !promoCode.trim()}
                        sx={{
                          minWidth: { xs: "100%", sm: 110 },
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 900,
                          borderColor: "rgba(96,165,250,.45)",
                        }}
                      >
                        {promoLoading ? <CircularProgress size={18} color="inherit" /> : "Apply"}
                      </Button>
                    </Stack>
                    {promoError && (
                      <Typography
                        component="p"
                        variant="caption"
                        sx={{ mt: 1, color: "#fca5a5", fontWeight: 700, lineHeight: 1.5 }}
                      >
                        {promoError}
                      </Typography>
                    )}
                  </>
                )}
              </Paper>

              {paymentMessage && (
                <Alert severity="success" sx={{ mt: 2, borderRadius: 2.5 }}>
                  {paymentMessage}
                </Alert>
              )}

              {paymentError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2.5 }}>
                  {paymentError}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={
                  paymentLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ShoppingCart />
                  )
                }
                disabled={paymentLoading}
                onClick={() => startPurchase("course")}
                sx={{
                  mt: 2.5,
                  py: 1.45,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 950,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg,#0875ff,#1d8cff)",
                }}
              >
                {paymentLoading
                  ? "Processing..."
                  : promoPricing
                    ? `Enroll Now — ₹${displayPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: displayPrice % 1 ? 2 : 0,
                        maximumFractionDigits: 2,
                      })}`
                    : "Enroll Now"}
              </Button>

              <Divider sx={{ my: 2.2, borderColor: "rgba(148,163,184,.2)" }}>
                <Typography component="span" variant="caption" sx={{ color: "#7891ad", fontWeight: 800 }}>
                  OR
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Bolt />}
                disabled={paymentLoading}
                onClick={() => startPurchase("all-access")}
                sx={{
                  py: 1.3,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 950,
                  color: "#0b2547",
                  bgcolor: "#fff",
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                Unlock All Modules — ₹
                {Number(course.allAccessPrice || 99).toLocaleString("en-IN")}
              </Button>

              <Typography
                component="p"
                variant="caption"
                display="block"
                textAlign="center"
                sx={{ mt: 2, color: "#7891ad", lineHeight: 1.7 }}
              >
                Secure payment powered by Razorpay. Access activates only after
                server-side verification.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                <Paper
                  component="section"
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.4,
                    bgcolor: "rgba(255,255,255,.04)",
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="span" sx={{ color: "#fff", fontWeight: 900 }}>∞</Typography>
                  <Typography component="p" variant="caption" sx={{ color: "#7891ad" }}>
                    Learn at your pace
                  </Typography>
                </Paper>
                <Paper
                  component="section"
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.4,
                    bgcolor: "rgba(255,255,255,.04)",
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="span" sx={{ color: "#fff", fontWeight: 900 }}>✓</Typography>
                  <Typography component="p" variant="caption" sx={{ color: "#7891ad" }}>
                    Certificate included
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

    </Box>
  );
}
