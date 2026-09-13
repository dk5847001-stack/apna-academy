import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Download,
  OpenInNew,
  WorkspacePremium,
} from "@mui/icons-material";

import dashboardService from "../services/dashboard.service";
import certificateService from "../services/certificate.service";
import { COURSE_URL } from "../constants/config";

const getId = (value) => value?._id || value?.id || value || "";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const reasonText = (reason) => {
  const messages = {
    COURSE_NOT_COMPLETED: "Complete 100% of the course to unlock your certificate.",
    COURSE_NOT_PURCHASED: "Purchase this course before requesting a certificate.",
    COURSE_NOT_FOUND: "This course is no longer available.",
  };
  return messages[reason] || "Finish the course requirements to unlock your certificate.";
};

export default function Certificates() {
  const [dashboard, setDashboard] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadCertificates = async ({ silent = false } = {}) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");

      const data = await dashboardService.getDashboard();
      setDashboard(data);

      const enrolledCourses = Array.isArray(data?.enrolledCourses)
        ? data.enrolledCourses
        : [];

      const statusEntries = await Promise.all(
        enrolledCourses.map(async (course) => {
          const courseId = getId(course);
          if (!courseId) return ["", null];

          try {
            const status = await certificateService.getCertificateStatus(courseId);
            return [String(courseId), status];
          } catch (statusError) {
            console.error("Certificate status error:", statusError);
            return [String(courseId), null];
          }
        })
      );

      setStatuses(Object.fromEntries(statusEntries.filter(([id]) => id)));
    } catch (err) {
      console.error("Certificates page error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load certificates."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const certificates = useMemo(
    () => (Array.isArray(dashboard?.certificates) ? dashboard.certificates : []),
    [dashboard]
  );

  const enrolledCourses = useMemo(
    () => (Array.isArray(dashboard?.enrolledCourses) ? dashboard.enrolledCourses : []),
    [dashboard]
  );

  const pendingCourses = useMemo(
    () =>
      enrolledCourses.filter((course) => {
        const status = statuses[String(getId(course))];
        return status && !status.alreadyIssued;
      }),
    [enrolledCourses, statuses]
  );

  const openIssueDialog = (course) => {
    setSelectedCourse(course);
    setRecipientName(dashboard?.user?.name || "");
    setActionError("");
    setDialogOpen(true);
  };

  const handleIssue = async () => {
    if (!selectedCourse) return;

    try {
      setIssuing(true);
      setActionError("");

      await certificateService.issueCertificate({
        courseId: getId(selectedCourse),
        recipientName,
      });

      setDialogOpen(false);
      setSelectedCourse(null);
      await loadCertificates({ silent: true });
    } catch (err) {
      console.error("Certificate issue error:", err);
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to issue certificate."
      );
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Loading your certificates...</Typography>
        </Stack>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="!h-14 !w-14 !bg-blue-50 !text-blue-700">
                <WorkspacePremium />
              </Avatar>
              <div>
                <Typography variant="h4" className="!font-black !text-slate-900">
                  Certificates
                </Typography>
                <Typography className="!mt-1 !text-slate-500">
                  Your verified achievements and course completion certificates.
                </Typography>
              </div>
            </div>

            <Button
              variant="outlined"
              onClick={() => loadCertificates({ silent: true })}
              disabled={refreshing}
              className="!rounded-xl !border-slate-200 !px-5 !font-bold !normal-case"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {error && (
            <Alert severity="error" className="!mt-6 !rounded-2xl">
              {error}
            </Alert>
          )}
        </div>
      </section>

      {certificates.length > 0 ? (
        <section className="space-y-4">
          <div>
            <Typography variant="h6" className="!font-extrabold !text-slate-900">
              Issued certificates
            </Typography>
            <Typography variant="body2" className="!text-slate-500">
              Download, verify, or open each certificate.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {certificates.map((certificate) => (
              <Card
                key={certificate.certificateId || certificate.id}
                className="!rounded-3xl !border !border-slate-200 !shadow-sm"
              >
                <CardContent className="!p-5 sm:!p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      variant="rounded"
                      className="!h-14 !w-14 !rounded-2xl !bg-blue-50 !text-blue-700"
                    >
                      <WorkspacePremium />
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Typography className="!font-extrabold !text-slate-900">
                          {certificate.course?.title || "Completed Course"}
                        </Typography>
                        <Chip
                          icon={<CheckCircle />}
                          label={certificate.isValid === false ? "Invalid" : "Verified"}
                          size="small"
                          color={certificate.isValid === false ? "error" : "success"}
                          variant="outlined"
                        />
                      </div>
                      <Typography variant="body2" className="!mt-1 !text-slate-500">
                        Issued to {certificate.recipientName || dashboard?.user?.name || "Student"}
                      </Typography>
                    </div>
                  </div>

                  <Divider className="!my-5" />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <Typography variant="caption" className="!font-bold !uppercase !tracking-wider !text-slate-400">
                        Certificate ID
                      </Typography>
                      <Typography variant="body2" className="mt-1 break-all !font-bold !text-slate-800">
                        {certificate.certificateId || "—"}
                      </Typography>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <Typography variant="caption" className="!font-bold !uppercase !tracking-wider !text-slate-400">
                        Issue date
                      </Typography>
                      <Typography variant="body2" className="mt-1 !font-bold !text-slate-800">
                        {formatDate(certificate.issueDate)}
                      </Typography>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {certificate.certificateUrl && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Download />}
                        component="a"
                        href={certificate.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="!rounded-xl !font-extrabold !normal-case"
                      >
                        Download Certificate
                      </Button>
                    )}
                    {certificate.verificationUrl && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<OpenInNew />}
                        component="a"
                        href={certificate.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="!rounded-xl !border-slate-200 !font-extrabold !normal-case"
                      >
                        Verify Certificate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <Card className="!rounded-3xl !border !border-slate-200 !shadow-sm">
          <CardContent className="!p-8 !text-center sm:!p-12">
            <WorkspacePremium className="!text-5xl !text-slate-300" />
            <Typography variant="h6" className="!mt-4 !font-extrabold !text-slate-900">
              No certificates issued yet
            </Typography>
            <Typography className="!mx-auto !mt-2 !max-w-xl !text-slate-500">
              Complete an enrolled course to become eligible for your certificate.
            </Typography>
          </CardContent>
        </Card>
      )}

      {pendingCourses.length > 0 && (
        <section className="space-y-4">
          <div>
            <Typography variant="h6" className="!font-extrabold !text-slate-900">
              Certificate eligibility
            </Typography>
            <Typography variant="body2" className="!text-slate-500">
              Certificates are issued only after the course is completed.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pendingCourses.map((course) => {
              const status = statuses[String(getId(course))];
              const progress = Number(status?.progress?.overallProgress || course.progress || 0);
              const eligible = Boolean(status?.eligible) && !status?.alreadyIssued;

              return (
                <Card
                  key={getId(course)}
                  className="!rounded-3xl !border !border-slate-200 !shadow-sm"
                >
                  <CardContent className="!p-5 sm:!p-6">
                    <div className="flex gap-4">
                      <Box
                        component="img"
                        src={course.thumbnail || ""}
                        alt={course.title || "Course"}
                        className="h-20 w-20 rounded-2xl object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <Typography className="!font-extrabold !text-slate-900">
                          {course.title || "Course"}
                        </Typography>
                        <Typography variant="body2" className="!mt-1 !text-slate-500">
                          {eligible ? "Certificate is ready to issue." : reasonText(status?.reason)}
                        </Typography>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <Typography variant="body2" className="!font-bold !text-slate-700">
                          Course progress
                        </Typography>
                        <Typography variant="body2" className="!font-extrabold !text-blue-700">
                          {Math.round(Math.max(0, Math.min(100, progress)))}%
                        </Typography>
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, progress))}
                        className="!h-2 !rounded-full"
                      />
                    </div>

                    <Button
                      fullWidth
                      variant={eligible ? "contained" : "outlined"}
                      disabled={!eligible}
                      onClick={() => openIssueDialog(course)}
                      className="!mt-5 !rounded-xl !font-extrabold !normal-case"
                    >
                      {eligible ? "Get Certificate" : "Complete Course First"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {certificates.length === 0 && enrolledCourses.length === 0 && (
        <Card className="!rounded-3xl !border !border-slate-200 !shadow-sm">
          <CardContent className="!p-8 !text-center">
            <Typography className="!font-bold !text-slate-700">
              You have no enrolled courses yet.
            </Typography>
            <Button
              component="a"
              href={`${COURSE_URL}/courses`}
              variant="contained"
              className="!mt-4 !rounded-xl !font-extrabold !normal-case"
            >
              Explore Courses
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => !issuing && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="!font-black">Issue your certificate</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="!mb-5 !text-slate-500">
            Enter your full name exactly as you want it printed on the certificate. This name becomes permanent for this certificate.
          </Typography>

          {actionError && (
            <Alert severity="error" className="!mb-4 !rounded-2xl">
              {actionError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Certificate full name"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            inputProps={{ maxLength: 100 }}
            disabled={issuing}
            autoFocus
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-5">
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={issuing}
            className="!font-bold !normal-case"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleIssue}
            disabled={issuing || !recipientName.trim()}
            className="!rounded-xl !font-extrabold !normal-case"
          >
            {issuing ? "Issuing..." : "Issue Certificate"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
