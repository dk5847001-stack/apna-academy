import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AccessTime,
  ArrowBack,
  Bolt,
  Book,
  ExpandMore,
  Lock,
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
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { COURSE_ROUTES, FRONTEND_URL } from "../constants/config";
import { getCourseBySlug, normalizeCourse } from "../services/course.service";
import api from "../services/api";
import { startCoursePayment } from "../services/payment";

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

const resolvePreviewUrl = (video) => {
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
        url.searchParams.set("autoplay", "true");
        url.searchParams.set("muted", "false");
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
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoAutoShown, setDemoAutoShown] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCourseBySlug(slug);
        if (!mounted) return;
        setCourse(normalizeCourse(result?.course));
        setModules(Array.isArray(result?.modules) ? result.modules : []);
        setExpandedModule(null);
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
    () => resolvePreviewUrl(previewVideo),
    [previewVideo]
  );

  useEffect(() => {
    if (!previewVideo || demoAutoShown) return undefined;
    const timer = window.setTimeout(() => {
      setDemoOpen(true);
      setDemoAutoShown(true);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [previewVideo, demoAutoShown]);

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#061a35", color: "#fff" }}>
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
            px: { xs: 2, md: 5 },
            minHeight: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
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
              <Typography fontWeight={900} lineHeight={1}>
                ApnaAcademy
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
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
            }}
          >
            Courses
          </Button>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, md: 5 },
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
            gap: { xs: 4, lg: 5 },
            alignItems: "start",
          }}
        >
          <Box>
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
                      muted
                      loop
                      playsInline
                      controls
                      preload="auto"
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
                        alt={course.title}
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
              onClick={() => setDemoOpen(true)}
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

            <Box sx={{ mt: { xs: 4, md: 5 } }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                  fontSize: { xs: "2.2rem", sm: "3rem", md: "4rem" },
                  lineHeight: 1.05,
                  fontWeight: 950,
                  letterSpacing: "-.045em",
                  color: "#f8fafc",
                }}
              >
                {course.title}
              </Typography>

              <Typography
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
                      alt={course.instructor.name}
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
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
                    <Typography variant="caption" sx={{ color: "#7891ad" }}>
                      Instructor
                    </Typography>
                    <Typography fontWeight={900} sx={{ color: "#fff" }}>
                      {course.instructor.name}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>

            <Box sx={{ mt: 5 }}>
              <Typography variant="h5" fontWeight={900}>
                Course Curriculum
              </Typography>
              <Typography sx={{ mt: 0.8, color: "#8ea5c0" }}>
                Explore the modules and preview lessons before enrolling.
              </Typography>

              <Box sx={{ mt: 2 }}>
                {modules.map((module, index) => {
                  const moduleId = getId(module) || `module-${index}`;
                  const videos = Array.isArray(module?.videos) ? module.videos : [];
                  const expanded = expandedModule === moduleId;

                  return (
                    <Accordion
                      key={moduleId}
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
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900}>
                            {module.title || `Module ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#7891ad" }}>
                            {videos.length} {videos.length === 1 ? "lesson" : "lessons"}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ pt: 0 }}>
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
                                    <PlayCircle sx={{ color: "#60a5fa" }} />
                                  ) : (
                                    <Lock sx={{ color: "#64748b" }} />
                                  )}
                                  <Typography noWrap fontWeight={700}>
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
                                    <Lock sx={{ color: "#64748b", fontSize: 18 }} />
                                  )}
                                  <Typography
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
            elevation={0}
            sx={{
              position: { lg: "sticky" },
              top: { lg: 92 },
              overflow: "hidden",
              borderRadius: { xs: 3, md: 4 },
              bgcolor: "#0a2342",
              border: "1px solid rgba(96,165,250,.28)",
              boxShadow: "0 28px 70px rgba(0,0,0,.32)",
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
                  alt={course.title}
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
                  <School sx={{ fontSize: 68, color: "#60a5fa" }} />
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
                <Security sx={{ color: "#16a34a", fontSize: 18 }} />
                <Typography variant="caption" fontWeight={900} sx={{ color: "#0f172a" }}>
                  Server-verified access
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography
                variant="caption"
                sx={{ color: "#7f9ab7", fontWeight: 800, letterSpacing: ".08em" }}
              >
                COURSE PRICE
              </Typography>
              <Typography
                sx={{ mt: 0.4, fontSize: "2.6rem", fontWeight: 950, color: "#fff" }}
              >
                ₹{Number(course.price || 0).toLocaleString("en-IN")}
              </Typography>

              {course.originalPrice &&
                Number(course.originalPrice) > Number(course.price || 0) && (
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Typography
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
                {paymentLoading ? "Processing..." : "Enroll Now"}
              </Button>

              <Divider sx={{ my: 2.2, borderColor: "rgba(148,163,184,.2)" }}>
                <Typography variant="caption" sx={{ color: "#7891ad", fontWeight: 800 }}>
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
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.4,
                    bgcolor: "rgba(255,255,255,.04)",
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: "#fff", fontWeight: 900 }}>∞</Typography>
                  <Typography variant="caption" sx={{ color: "#7891ad" }}>
                    Learn at your pace
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.4,
                    bgcolor: "rgba(255,255,255,.04)",
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: "#fff", fontWeight: 900 }}>✓</Typography>
                  <Typography variant="caption" sx={{ color: "#7891ad" }}>
                    Certificate included
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: "#061a35",
            color: "#fff",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(96,165,250,.35)",
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5, px: 0.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={950}>
                Demo Class
              </Typography>
              <Typography variant="body2" sx={{ color: "#7891ad" }}>
                {previewVideo?.title || course.title}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDemoOpen(false)}
              sx={{ color: "#fff" }}
              aria-label="Close demo"
            >
              <Box component="span" sx={{ fontSize: 28, lineHeight: 1 }}>
                ×
              </Box>
            </IconButton>
          </Stack>

          <Box
            sx={{
              aspectRatio: "16 / 9",
              bgcolor: "#000",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {previewUrl ? (
              isDirectMedia(previewUrl) ? (
                <Box
                  component="video"
                  src={previewUrl}
                  autoPlay
                  muted
                  controls
                  playsInline
                  preload="auto"
                  sx={{ width: "100%", height: "100%", display: "block" }}
                />
              ) : (
                <Box
                  component="iframe"
                  src={previewUrl}
                  title="Demo Class"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  sx={{ width: "100%", height: "100%", border: 0 }}
                />
              )
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  color: "#94a3b8",
                }}
              >
                Preview video is unavailable.
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
