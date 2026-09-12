import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowBack,
  Book,
  CheckCircle,
  ExpandMore,
  Lock,
  PlayCircle,
  School,
  Security,
  ShoppingCart,
  Star,
  AccessTime,
  People,
  Bolt,
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
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  COURSE_ROUTES,
  DASHBOARD_URL,
  STORAGE_KEYS,
} from "../constants/config";

import {
  getCourseBySlug,
  normalizeCourse,
} from "../services/course.service";

import { startCoursePayment } from "../services/payment";

/* =========================================================
   HELPERS
========================================================= */

const formatDuration = (seconds = 0) => {
  const totalSeconds = Number(seconds) || 0;

  if (!totalSeconds) {
    return "—";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds =
    Math.floor(totalSeconds % 60);

  if (minutes < 60) {
    return `${minutes}m${
      remainingSeconds
        ? ` ${remainingSeconds}s`
        : ""
    }`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h${
    remainingMinutes
      ? ` ${remainingMinutes}m`
      : ""
  }`;
};

const getInitial = (name = "") => {
  return (
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "A"
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  const [expandedModule, setExpandedModule] =
    useState(null);

  /* =======================================================
     LOAD COURSE
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await getCourseBySlug(slug);

        if (!mounted) {
          return;
        }

        const normalizedCourse =
          normalizeCourse(result?.course);

        setCourse(normalizedCourse);
        setModules(
          Array.isArray(result?.modules)
            ? result.modules
            : []
        );

        if (result?.modules?.length) {
          setExpandedModule(
            result.modules[0].id
          );
        }
      } catch (err) {
        console.error(
          "Course details error:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this course."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      loadCourse();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* =======================================================
     USER
  ======================================================= */

  const getToken = () => {
    return localStorage.getItem(
      STORAGE_KEYS.TOKEN
    );
  };

  const getUser = () => {
    try {
      const storedUser =
        localStorage.getItem(
          STORAGE_KEYS.USER
        );

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  };

  /* =======================================================
     LOGIN REDIRECT
  ======================================================= */

  const redirectToLogin = () => {
    navigate("/login", {
      state: {
        message:
          "Please login to continue.",
        redirectTo:
          COURSE_ROUTES.DETAILS(slug),
      },
    });
  };

  /* =======================================================
     COURSE PAYMENT
  ======================================================= */

  const handleEnroll = async () => {
    setPaymentMessage("");
    setPaymentError("");

    const token = getToken();

    if (!token) {
      redirectToLogin();
      return;
    }

    if (!course?.id) {
      setPaymentError(
        "Course information is unavailable."
      );
      return;
    }

    try {
      setPaymentLoading(true);

      const user = getUser();

      await startCoursePayment({
        courseId: course.id,
        courseTitle: course.title,
        purchaseType: "course",
        user,

        onSuccess: () => {
          setPaymentMessage(
            "Payment successful. Your course access is now active."
          );

          window.setTimeout(() => {
            navigate(
              COURSE_ROUTES.LEARN(slug)
            );
          }, 1000);
        },

        onFailure: (result) => {
          setPaymentError(
            result?.message ||
              "Payment could not be completed. Please try again."
          );
        },
      });
    } catch (err) {
      console.error(
        "Course payment error:",
        err
      );

      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /* =======================================================
     ALL ACCESS PAYMENT
  ======================================================= */

  const handleAllAccess = async () => {
    setPaymentMessage("");
    setPaymentError("");

    const token = getToken();

    if (!token) {
      redirectToLogin();
      return;
    }

    if (!course?.id) {
      setPaymentError(
        "Course information is unavailable."
      );
      return;
    }

    try {
      setPaymentLoading(true);

      const user = getUser();

      await startCoursePayment({
        courseId: course.id,
        courseTitle: course.title,
        purchaseType: "all-access",
        user,

        onSuccess: () => {
          setPaymentMessage(
            "All modules unlocked successfully."
          );

          window.setTimeout(() => {
            navigate(
              COURSE_ROUTES.LEARN(slug)
            );
          }, 1000);
        },

        onFailure: (result) => {
          setPaymentError(
            result?.message ||
              "All-access payment could not be completed."
          );
        },
      });
    } catch (err) {
      console.error(
        "All-access payment error:",
        err
      );

      setPaymentError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start all-access payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress
            size={38}
            thickness={4}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading course...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !course) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack
              spacing={2.5}
              alignItems="center"
              textAlign="center"
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  backgroundColor:
                    "rgba(25,118,210,0.08)",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <School />
              </Box>

              <Typography
                variant="h5"
                fontWeight={800}
              >
                Course unavailable
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {error ||
                  "This course could not be found."}
              </Typography>

              <Button
                component={Link}
                to="/"
                variant="contained"
                startIcon={<ArrowBack />}
              >
                Back to Courses
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "text.primary",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor:
            "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background:
                  "linear-gradient(135deg,#1976d2,#42a5f5)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 8px 24px rgba(25,118,210,0.20)",
              }}
            >
              <School fontSize="small" />
            </Box>

            <Box>
              <Typography
                fontWeight={900}
                lineHeight={1}
              >
                ApnaAcademy
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Learn. Build. Grow.
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            to="/"
            variant="outlined"
            size="small"
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Courses
          </Button>
        </Box>
      </Box>

      {/* ===================================================
          HERO
      =================================================== */}

      <Box
        component="main"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 4, sm: 6, lg: 8 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0,1.4fr) minmax(340px,0.7fr)",
            },
            gap: { xs: 4, lg: 6 },
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                label={
                  course.category ||
                  "Development"
                }
                color="primary"
                size="small"
              />

              <Chip
                label={
                  course.level ||
                  "All Levels"
                }
                variant="outlined"
                size="small"
              />

              {course.isFeatured && (
                <Chip
                  icon={<Star />}
                  label="Featured"
                  color="warning"
                  size="small"
                />
              )}
            </Stack>

            <Typography
              component="h1"
              sx={{
                mt: 3,
                fontSize: {
                  xs: "2rem",
                  sm: "2.8rem",
                  lg: "3.8rem",
                },
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-0.035em",
              }}
            >
              {course.title}
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                maxWidth: 780,
                color: "text.secondary",
                fontSize: {
                  xs: "1rem",
                  sm: "1.1rem",
                },
                lineHeight: 1.75,
              }}
            >
              {course.shortDescription ||
                course.description ||
                "Build practical skills through structured, project-focused learning."}
            </Typography>

            {/* STATS */}

            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1.5}
              sx={{ mt: 3.5 }}
            >
              <Chip
                icon={<Book />}
                label={`${course.totalModules || modules.length} Modules`}
                variant="outlined"
              />

              <Chip
                icon={<PlayCircle />}
                label={`${course.totalVideos || "Multiple"} Videos`}
                variant="outlined"
              />

              <Chip
                icon={<AccessTime />}
                label={`${course.durationDays || 30} Days`}
                variant="outlined"
              />

              <Chip
                icon={<People />}
                label="Practical Learning"
                variant="outlined"
              />
            </Stack>

            {/* INSTRUCTOR */}

            {course.instructor?.name && (
              <Paper
                elevation={0}
                sx={{
                  mt: 4,
                  p: 2,
                  maxWidth: 420,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                {course.instructor.avatar ? (
                  <Box
                    component="img"
                    src={course.instructor.avatar}
                    alt={
                      course.instructor.name
                    }
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      backgroundColor:
                        "primary.50",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                    }}
                  >
                    {getInitial(
                      course.instructor.name
                    )}
                  </Box>
                )}

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Instructor
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {course.instructor.name}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>

          {/* RIGHT PURCHASE CARD */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
              overflow: "hidden",
              position: {
                lg: "sticky",
              },
              top: {
                lg: 92,
              },
              boxShadow:
                "0 18px 50px rgba(15,23,42,0.08)",
            }}
          >
            {course.thumbnail ? (
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  backgroundColor:
                    "grey.100",
                }}
              >
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

                <Box
                  sx={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor:
                      "rgba(255,255,255,0.94)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Security
                    sx={{
                      fontSize: 17,
                      color:
                        "success.main",
                    }}
                  />

                  <Typography
                    variant="caption"
                    fontWeight={800}
                  >
                    Secure Learning
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  aspectRatio: "16 / 9",
                  backgroundColor:
                    "primary.50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <School
                  sx={{
                    fontSize: 64,
                    color: "primary.main",
                  }}
                />
              </Box>
            )}

            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                COURSE PRICE
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "2rem",
                  fontWeight: 900,
                }}
              >
                ₹
                {Number(
                  course.price || 0
                ).toLocaleString("en-IN")}
              </Typography>

              <Chip
                label="Instant Access"
                color="success"
                size="small"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              />

              {paymentMessage && (
                <Alert
                  severity="success"
                  sx={{
                    mt: 2.5,
                    borderRadius: 2.5,
                  }}
                >
                  {paymentMessage}
                </Alert>
              )}

              {paymentError && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 2.5,
                    borderRadius: 2.5,
                  }}
                >
                  {paymentError}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={
                  paymentLoading ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <ShoppingCart />
                  )
                }
                disabled={paymentLoading}
                onClick={handleEnroll}
                sx={{
                  mt: 2.5,
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                {paymentLoading
                  ? "Processing..."
                  : "Enroll Now"}
              </Button>

              <Divider sx={{ my: 2.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  OR
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Bolt />}
                disabled={paymentLoading}
                onClick={handleAllAccess}
                sx={{
                  py: 1.35,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                Unlock All Modules — ₹
                {Number(
                  course.allAccessPrice || 99
                ).toLocaleString("en-IN")}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                display="block"
                sx={{
                  mt: 2,
                  lineHeight: 1.7,
                }}
              >
                Secure payment powered by
                Razorpay. Access is activated
                only after server-side payment
                verification.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* =================================================
            CURRICULUM
        ================================================= */}

        <Box sx={{ mt: { xs: 7, lg: 10 } }}>
          <Typography
            component="h2"
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2.2rem",
              },
              fontWeight: 900,
              letterSpacing: "-0.025em",
            }}
          >
            Course Curriculum
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
            }}
          >
            Explore the modules and preview
            the first lesson of each module.
          </Typography>

          <Stack spacing={2} sx={{ mt: 3 }}>
            {modules.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  textAlign: "center",
                }}
              >
                <Typography
                  fontWeight={700}
                >
                  Curriculum is being prepared.
                </Typography>
              </Paper>
            ) : (
              modules.map((module, moduleIndex) => {
                const moduleId =
                  module.id ||
                  module._id ||
                  `module-${moduleIndex}`;

                const videos =
                  Array.isArray(
                    module.videos
                  )
                    ? module.videos
                    : [];

                return (
                  <Accordion
                    key={moduleId}
                    expanded={
                      expandedModule ===
                      moduleId
                    }
                    onChange={() =>
                      setExpandedModule(
                        (current) =>
                          current ===
                          moduleId
                            ? null
                            : moduleId
                      )
                    }
                    disableGutters
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor:
                        "divider",
                      borderRadius:
                        "16px !important",
                      overflow: "hidden",
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMore />
                      }
                      sx={{
                        px: {
                          xs: 2,
                          sm: 3,
                        },
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            label={`Module ${
                              module.order ||
                              moduleIndex +
                                1
                            }`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />

                          <Chip
                            label={`${videos.length} ${
                              videos.length ===
                              1
                                ? "Video"
                                : "Videos"
                            }`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        <Typography
                          sx={{
                            mt: 1,
                            fontWeight: 850,
                            fontSize: {
                              xs: "1rem",
                              sm: "1.05rem",
                            },
                          }}
                        >
                          {module.title}
                        </Typography>

                        {module.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                            }}
                          >
                            {
                              module.description
                            }
                          </Typography>
                        )}
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{
                        px: {
                          xs: 2,
                          sm: 3,
                        },
                        pb: 3,
                        pt: 0,
                      }}
                    >
                      <Stack
                        spacing={1}
                      >
                        {videos.map(
                          (
                            video,
                            videoIndex
                          ) => {
                            const isPreview =
                              Boolean(
                                video.isPreview
                              );

                            return (
                              <Paper
                                key={
                                  video.id ||
                                  video._id ||
                                  `video-${videoIndex}`
                                }
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  border:
                                    "1px solid",
                                  borderColor:
                                    "divider",
                                  borderRadius: 2.5,
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: 1.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    flexShrink: 0,
                                    borderRadius: 2,
                                    backgroundColor:
                                      isPreview
                                        ? "primary.50"
                                        : "grey.100",
                                    color:
                                      isPreview
                                        ? "primary.main"
                                        : "text.secondary",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                  }}
                                >
                                  {isPreview ? (
                                    <PlayCircle />
                                  ) : (
                                    <Lock />
                                  )}
                                </Box>

                                <Box
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  <Typography
                                    fontWeight={750}
                                    sx={{
                                      overflow:
                                        "hidden",
                                      textOverflow:
                                        "ellipsis",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {video.title}
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Lesson{" "}
                                      {video.order ||
                                        videoIndex +
                                          1}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      •
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formatDuration(
                                        video.duration
                                      )}
                                    </Typography>
                                  </Stack>
                                </Box>

                                {isPreview ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                      navigate(
                                        COURSE_ROUTES.VIDEO(
                                          slug,
                                          video.id
                                        )
                                      );
                                    }}
                                    sx={{
                                      flexShrink: 0,
                                      borderRadius: 2,
                                      fontWeight: 800,
                                      textTransform:
                                        "none",
                                    }}
                                  >
                                    Preview
                                  </Button>
                                ) : (
                                  <Chip
                                    icon={
                                      <Lock />
                                    }
                                    label="Locked"
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </Paper>
                            );
                          }
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })
            )}
          </Stack>
        </Box>

        {/* =================================================
            TRUST SECTION
        ================================================= */}

        <Box
          sx={{
            mt: { xs: 7, lg: 10 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3,1fr)",
            },
            gap: 2,
          }}
        >
          {[
            {
              icon: <Security />,
              title: "Secure Learning",
              text: "Your course access is protected by server-side authorization.",
            },
            {
              icon: <CheckCircle />,
              title: "Practical Curriculum",
              text: "Learn through structured modules and practical lessons.",
            },
            {
              icon: <People />,
              title: "Built for Learners",
              text: "A focused learning experience designed for consistent progress.",
            },
          ].map((item) => (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor:
                    "primary.50",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </Box>

              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 850,
                }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  lineHeight: 1.7,
                }}
              >
                {item.text}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* DASHBOARD CTA */}

        <Paper
          elevation={0}
          sx={{
            mt: 5,
            p: {
              xs: 3,
              sm: 4,
            },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "primary.100",
            backgroundColor:
              "primary.50",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                fontWeight={900}
              >
                Already enrolled?
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Continue your learning from
                your student dashboard.
              </Typography>
            </Box>

            <Button
              component="a"
              href={DASHBOARD_URL}
              variant="contained"
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              Open Dashboard
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}