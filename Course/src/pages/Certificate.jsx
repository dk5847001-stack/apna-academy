import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CheckCircle,
  Download,
  Verified,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  DASHBOARD_URL,
  COURSE_ROUTES,
} from "../constants/config";

import {
  getCourseBySlug,
} from "../services/course.service";

import {
  getCertificateStatus,
  issueCertificate,
} from "../services/certificate.service";

/* =========================================================
   CERTIFICATE PAGE
========================================================= */

export default function Certificate() {
  const navigate = useNavigate();

  const { slug } = useParams();

  const [course, setCourse] =
    useState(null);

  const [status, setStatus] =
    useState(null);

  const [certificateName, setCertificateName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [issuing, setIssuing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     LOAD COURSE + CERTIFICATE STATUS
  ======================================================= */

  const loadCertificateData =
    useCallback(async () => {
      if (!slug) {
        setError(
          "Course information is unavailable."
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setError("");

      try {
        /* -----------------------------------------------
           Get course using URL slug
        ----------------------------------------------- */

        const courseResult =
          await getCourseBySlug(
            slug
          );

        const courseData =
          courseResult?.course;

        if (!courseData) {
          throw new Error(
            "Course information could not be loaded."
          );
        }

        const courseId =
          courseData._id ||
          courseData.id;

        if (!courseId) {
          throw new Error(
            "Course ID is missing."
          );
        }

        if (
          !courseData.title
        ) {
          courseData.title =
            "Course";
        }

        setCourse(
          courseData
        );

        /* -----------------------------------------------
           Get certificate status
        ----------------------------------------------- */

        const certificateStatus =
          await getCertificateStatus(
            courseId
          );

        setStatus(
          certificateStatus
        );

        /* -----------------------------------------------
           Restore already saved name
        ----------------------------------------------- */

        if (
          certificateStatus
            ?.certificate
            ?.recipientName
        ) {
          setCertificateName(
            certificateStatus
              .certificate
              .recipientName
          );
        }
      } catch (requestError) {
        console.error(
          "Unable to load certificate data:",
          requestError
        );

        if (
          requestError?.response
            ?.status === 401
        ) {
          setError(
            "Your session has expired. Please login again."
          );

          return;
        }

        setError(
          requestError?.response?.data
            ?.message ||
            requestError?.message ||
            "Unable to load certificate information."
        );
      } finally {
        setLoading(false);
      }
    }, [slug]);

  useEffect(() => {
    loadCertificateData();
  }, [
    loadCertificateData,
  ]);

  /* =======================================================
     ISSUE CERTIFICATE
  ======================================================= */

  const handleIssueCertificate =
    async () => {
      if (issuing) {
        return;
      }

      const trimmedName =
        certificateName.trim();

      if (!trimmedName) {
        setError(
          "Please enter your full name."
        );

        return;
      }

      if (
        trimmedName.length < 2
      ) {
        setError(
          "Name must contain at least 2 characters."
        );

        return;
      }

      if (
        trimmedName.length > 100
      ) {
        setError(
          "Name cannot exceed 100 characters."
        );

        return;
      }

      const courseId =
        course?._id ||
        course?.id;

      if (!courseId) {
        setError(
          "Course ID is unavailable."
        );

        return;
      }

      setIssuing(true);
      setError("");
      setSuccess("");

      try {
        const certificate =
          await issueCertificate({
            courseId,
            recipientName:
              trimmedName,
          });

        setStatus(
          (previous) => ({
            ...(previous || {}),
            eligible: true,
            alreadyIssued: true,
            reason:
              "Certificate has already been issued.",
            certificate,
          })
        );

        setCertificateName(
          certificate?.recipientName ||
            trimmedName
        );

        setSuccess(
          "Your certificate has been issued successfully."
        );
      } catch (requestError) {
        console.error(
          "Unable to issue certificate:",
          requestError
        );

        setError(
          requestError?.response?.data
            ?.message ||
            requestError?.message ||
            "Unable to issue certificate."
        );
      } finally {
        setIssuing(false);
      }
    };

  /* =======================================================
     OPEN CERTIFICATE
  ======================================================= */

  const handleOpenCertificate =
    () => {
      const certificateUrl =
        status?.certificate
          ?.certificateUrl;

      if (!certificateUrl) {
        setError(
          "Certificate file is not available yet."
        );

        return;
      }

      window.open(
        certificateUrl,
        "_blank",
        "noopener,noreferrer"
      );
    };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleBackToCourse =
    () => {
      navigate(
        COURSE_ROUTES.LEARN(
          slug
        )
      );
    };

  const handleDashboard =
    () => {
      window.location.href =
        DASHBOARD_URL;
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor:
            "#ffffff",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          px: 2,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading certificate
            information...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (
    error &&
    !status &&
    !course
  ) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor:
            "#ffffff",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          px: 2,
        }}
      >
        <Stack
          spacing={2}
          maxWidth={520}
          width="100%"
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>

          <Button
            variant="contained"
            onClick={
              handleBackToCourse
            }
            sx={{
              alignSelf:
                "flex-start",
              borderRadius: 2,
              fontWeight: 800,
              textTransform:
                "none",
            }}
          >
            Back to Course
          </Button>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const certificate =
    status?.certificate;

  const isIssued =
    Boolean(
      status?.alreadyIssued &&
        certificate
    );

  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(
        status?.progress
          ?.overallProgress
      ) || 0
    )
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor:
          "#ffffff",
        py: {
          xs: 3,
          md: 5,
        },
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 980,
          mx: "auto",
        }}
      >
        {/* Back button */}

        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={
            handleBackToCourse
          }
          sx={{
            mb: 3,
            textTransform:
              "none",
            fontWeight: 700,
          }}
        >
          Back to Course
        </Button>

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e5e7eb",
            borderRadius: {
              xs: 3,
              md: 4,
            },
            overflow: "hidden",
            boxShadow:
              "0 18px 50px rgba(15, 23, 42, 0.07)",
          }}
        >
          {/* =================================================
             HEADER
          ================================================= */}

          <Box
            sx={{
              px: {
                xs: 2.5,
                sm: 4,
              },
              py: {
                xs: 3,
                md: 4,
              },
              background:
                "linear-gradient(135deg, #eff6ff 0%, #ffffff 70%)",
              borderBottom:
                "1px solid #e5e7eb",
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
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    "#dbeafe",
                  color:
                    "#2563eb",
                }}
              >
                <WorkspacePremium
                  sx={{
                    fontSize: 34,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={850}
                  sx={{
                    fontSize: {
                      xs: "1.65rem",
                      md: "2rem",
                    },
                    letterSpacing:
                      "-0.02em",
                  }}
                >
                  Course Certificate
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {course?.title ||
                    "Your Course"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* =================================================
             CONTENT
          ================================================= */}

          <CardContent
            sx={{
              p: {
                xs: 2.5,
                sm: 4,
              },
            }}
          >
            <Stack spacing={3}>
              {/* Error */}

              {error && (
                <Alert
                  severity="error"
                  onClose={() =>
                    setError("")
                  }
                >
                  {error}
                </Alert>
              )}

              {/* Success */}

              {success && (
                <Alert
                  severity="success"
                  onClose={() =>
                    setSuccess("")
                  }
                >
                  {success}
                </Alert>
              )}

              {/* =================================================
                 ISSUED CERTIFICATE
              ================================================= */}

              {isIssued ? (
                <Stack spacing={3}>
                  <Box
                    sx={{
                      p: {
                        xs: 2.5,
                        md: 3,
                      },
                      borderRadius: 3,
                      backgroundColor:
                        "#f0fdf4",
                      border:
                        "1px solid #bbf7d0",
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
                    >
                      <CheckCircle
                        sx={{
                          color:
                            "#16a34a",
                          fontSize: 36,
                        }}
                      />

                      <Box>
                        <Typography
                          fontWeight={800}
                        >
                          Certificate Issued
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Your certificate
                          has been
                          successfully
                          generated.
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Holder */}

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Certificate Holder
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={850}
                    >
                      {
                        certificate?.recipientName
                      }
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Certificate details */}

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1.5}
                    flexWrap="wrap"
                  >
                    <Chip
                      icon={
                        <Verified />
                      }
                      label={
                        certificate?.isValid
                          ? "Verified Certificate"
                          : "Certificate Invalid"
                      }
                      color={
                        certificate?.isValid
                          ? "success"
                          : "error"
                      }
                      variant="outlined"
                    />

                    {certificate
                      ?.certificateId && (
                      <Chip
                        label={`ID: ${certificate.certificateId}`}
                        variant="outlined"
                      />
                    )}

                    {certificate
                      ?.issueDate && (
                      <Chip
                        label={`Issued: ${new Date(
                          certificate.issueDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}`}
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Open */}

                  {certificate
                    ?.certificateUrl && (
                    <Button
                      variant="contained"
                      startIcon={
                        <Download />
                      }
                      onClick={
                        handleOpenCertificate
                      }
                      sx={{
                        alignSelf: {
                          xs: "stretch",
                          sm: "flex-start",
                        },
                        minHeight: 48,
                        px: 3,
                        textTransform:
                          "none",
                        fontWeight: 800,
                        borderRadius: 2.5,
                      }}
                    >
                      Open Certificate
                    </Button>
                  )}
                </Stack>
              ) : (
                /* =================================================
                   NOT ISSUED
                ================================================= */

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      Certificate Status
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                      }}
                    >
                      Complete the
                      course requirements
                      to receive your
                      certificate.
                    </Typography>
                  </Box>

                  {/* Progress */}

                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor:
                        "#f8fafc",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          Course Progress
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="primary"
                        >
                          {progress}%
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          overflow:
                            "hidden",
                          backgroundColor:
                            "#e2e8f0",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${progress}%`,
                            height: "100%",
                            backgroundColor:
                              "#2563eb",
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {/* Status */}

                  {!status?.eligible ? (
                    <Alert
                      severity="info"
                    >
                      {status?.reason ||
                        "You are not eligible for a certificate yet."}
                    </Alert>
                  ) : (
                    <Stack spacing={2.5}>
                      <Alert
                        severity="success"
                        icon={
                          <CheckCircle />
                        }
                      >
                        You are eligible
                        to receive your
                        certificate.
                      </Alert>

                      {/* Name */}

                      <TextField
                        fullWidth
                        label="Full Name on Certificate"
                        value={
                          certificateName
                        }
                        onChange={(
                          event
                        ) => {
                          setCertificateName(
                            event.target
                              .value
                          );

                          setError("");
                        }}
                        placeholder="Enter your full name"
                        helperText="Enter your name exactly as you want it displayed on the certificate."
                        inputProps={{
                          maxLength: 100,
                        }}
                        disabled={
                          issuing
                        }
                      />

                      {/* Generate */}

                      <Button
                        variant="contained"
                        onClick={
                          handleIssueCertificate
                        }
                        disabled={
                          issuing ||
                          !certificateName.trim()
                        }
                        startIcon={
                          issuing ? (
                            <CircularProgress
                              size={18}
                              color="inherit"
                            />
                          ) : (
                            <WorkspacePremium />
                          )
                        }
                        sx={{
                          minHeight: 50,
                          alignSelf: {
                            xs: "stretch",
                            sm: "flex-start",
                          },
                          px: 3,
                          textTransform:
                            "none",
                          fontWeight: 800,
                          borderRadius: 2.5,
                        }}
                      >
                        {issuing
                          ? "Generating Certificate..."
                          : "Generate My Certificate"}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              )}

              <Divider />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Certificate details are
                securely linked to your
                ApnaAcademy account.
              </Typography>

              <Button
                variant="text"
                onClick={
                  handleDashboard
                }
                sx={{
                  alignSelf: {
                    xs: "stretch",
                    sm: "flex-start",
                  },
                  textTransform:
                    "none",
                  fontWeight: 700,
                }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}