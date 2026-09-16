import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lock, School, Verified, WorkspacePremium } from "@mui/icons-material";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import api from "../services/api";
import { getCourseBySlug, normalizeCourse } from "../services/course.service";

const getDisplayName = (user) => {
  if (!user) return "Your Name";
  return (
    user.fullName ||
    user.name ||
    user.username ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Your Name"
  );
};

const safeCourseTitle = (course) => course?.title || "Course Completion";

export default function CertificatePreview({ course: providedCourse = null }) {
  const { slug } = useParams();
  const [course, setCourse] = useState(providedCourse);
  const [userName, setUserName] = useState("Your Name");
  const [loading, setLoading] = useState(!providedCourse);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setAuthLoading(true);
        const response = await api.get("/auth/me");
        if (!mounted) return;
        if (response?.data?.success && response?.data?.data) {
          setUserName(getDisplayName(response.data.data));
        }
      } catch (requestError) {
        if (!mounted) return;
        if (requestError?.response?.status !== 401) {
          console.error("Certificate preview auth error:", requestError);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (providedCourse || !slug) return undefined;
    let mounted = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getCourseBySlug(slug);
        if (!mounted) return;
        if (!result?.course) throw new Error("Course information could not be loaded.");
        setCourse(normalizeCourse(result.course));
      } catch (requestError) {
        if (!mounted) return;
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load certificate preview."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCourse();
    return () => {
      mounted = false;
    };
  }, [providedCourse, slug]);

  if (loading || authLoading) {
    return (
      <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Preparing your certificate preview...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error && !course) {
    return <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>;
  }

  const title = safeCourseTitle(course);

  return (
    <Box
      component="section"
      aria-label="Locked certificate preview"
      sx={{
        mt: { xs: 6, md: 8 },
        mb: { xs: 4, md: 7 },
        px: { xs: 0, sm: 1 },
      }}
    >
      <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <WorkspacePremium sx={{ color: "#f4c84a" }} />
          <Typography sx={{ fontWeight: 950, color: "#fff", fontSize: { xs: "1.35rem", md: "1.65rem" } }}>
            Your Certificate Preview
          </Typography>
        </Stack>
        <Typography sx={{ color: "#94a3b8", maxWidth: 680 }}>
          Your registered name will appear automatically. Complete the course and required assessment to unlock the official certificate.
        </Typography>
      </Stack>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          borderRadius: { xs: 2.5, md: 4 },
          background: "#fffef8",
          border: "1px solid rgba(210,187,89,.55)",
          boxShadow: "0 30px 90px rgba(0,0,0,.38), inset 0 0 0 8px rgba(210,187,89,.08)",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, opacity: 0.72 }}>
          <Box sx={{ position: "absolute", width: "28%", height: "28%", left: "-4%", top: "-3%", border: "3px solid #0d4d73", transform: "rotate(24deg) skewX(-12deg)" }} />
          <Box sx={{ position: "absolute", width: "24%", height: "26%", left: "-8%", top: "19%", border: "2px solid #1788c9", transform: "rotate(-22deg)" }} />
          <Box sx={{ position: "absolute", right: "0", top: "0", width: "5%", height: "25%", background: "linear-gradient(90deg,#d2bb59,#eee5bd)" }} />
          <Box sx={{ position: "absolute", right: "2.3%", top: "13%", width: "8.5%", aspectRatio: "1", borderRadius: "50%", border: "6px solid #d2bb59", background: "#fffef8", boxShadow: "0 0 0 8px #eee5bd" }} />
          <Box sx={{ position: "absolute", right: "3.8%", top: "14.6%", width: "5.5%", aspectRatio: "1", borderRadius: "50%", border: "2px solid #0d4d73" }} />
          <Box sx={{ position: "absolute", left: "0", bottom: "0", width: "8%", height: "15%", background: "linear-gradient(90deg,#4f9d59,#8bcf69)" }} />
        </Box>

        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", px: { xs: 2, md: 6 }, pt: { xs: "5%", md: "5.5%" }, color: "#0d4d73" }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={{ width: { xs: 30, md: 48 }, height: { xs: 30, md: 48 }, borderRadius: { xs: 1, md: 1.7 }, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#1788c9,#0d4d73)", color: "#fff" }}>
              <School sx={{ fontSize: { xs: 20, md: 32 } }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 950, fontSize: { xs: "1rem", sm: "1.35rem", md: "2rem" }, lineHeight: 1 }}>Apna College</Typography>
              <Typography sx={{ fontSize: { xs: "5px", sm: "8px", md: "11px" }, letterSpacing: { xs: 0.8, md: 2 }, mt: 0.4 }}>LEARN  •  BUILD  •  ACHIEVE</Typography>
            </Box>
          </Stack>

          <Typography sx={{ mt: { xs: "4%", md: "3.5%" }, fontWeight: 950, fontSize: { xs: "1.8rem", sm: "2.8rem", md: "4.3rem" }, letterSpacing: { xs: 1, md: 2 }, lineHeight: 1 }}>CERTIFICATE</Typography>
          <Typography sx={{ mt: { xs: 0.4, md: 0.8 }, fontSize: { xs: ".75rem", sm: "1.2rem", md: "2rem" }, letterSpacing: { xs: 1, md: 3 }, lineHeight: 1 }}>OF COMPLETION</Typography>
          <Box sx={{ width: { xs: "32%", md: "29%" }, height: 1.5, bgcolor: "#0d4d73", mt: { xs: 1, md: 1.8 }, opacity: .8 }} />

          <Typography sx={{ mt: { xs: "3.5%", md: "3.8%" }, color: "#5e788a", fontSize: { xs: ".58rem", sm: ".8rem", md: "1.05rem" } }}>This certificate is proudly presented to</Typography>
          <Typography sx={{ mt: { xs: 0.5, md: 1 }, fontWeight: 600, color: "#111", fontSize: { xs: "1.15rem", sm: "1.8rem", md: "2.65rem" }, fontFamily: "cursive", maxWidth: "72%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</Typography>
          <Box sx={{ width: { xs: "45%", md: "48%" }, height: 2, bgcolor: "#0d4d73", mt: { xs: 0.5, md: 0.8 } }} />
          <Typography sx={{ mt: { xs: 1.4, md: 1.8 }, color: "#5e788a", fontSize: { xs: ".58rem", sm: ".8rem", md: "1rem" } }}>for successfully completing the course of</Typography>
          <Typography sx={{ mt: { xs: 0.3, md: 0.7 }, fontWeight: 900, color: "#0d4d73", fontSize: { xs: ".7rem", sm: "1rem", md: "1.55rem" }, maxWidth: "58%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</Typography>

          <Box sx={{ position: "absolute", left: "7%", bottom: "8%", width: { xs: "10%", md: "12%" }, height: "19%", borderRadius: "50% 50% 35% 35%", background: "linear-gradient(160deg,#111827 30%,#4f6ac9 31%,#4f6ac9 100%)", opacity: .8 }} />
          <Box sx={{ position: "absolute", left: "9.5%", bottom: "14%", width: { xs: "4%", md: "5%" }, aspectRatio: "1", borderRadius: "50%", background: "#f4c6a4", opacity: .85 }} />

          <Stack sx={{ position: "absolute", right: "13%", bottom: "14%", alignItems: "center" }}>
            <Box sx={{ width: { xs: 45, md: 78 }, height: { xs: 45, md: 78 }, p: 1, border: "2px solid #0d4d73", borderRadius: 1.5, background: "#fff" }}>
              <Box sx={{ width: "100%", height: "100%", background: "repeating-linear-gradient(45deg,#111 0 2px,#fff 2px 5px),repeating-linear-gradient(-45deg,transparent 0 3px,#111 3px 5px)" }} />
            </Box>
            <Typography sx={{ mt: .5, fontWeight: 900, fontSize: { xs: "5px", md: "8px" }, color: "#0d4d73" }}>SCAN TO VERIFY</Typography>
          </Stack>

          <Stack sx={{ position: "absolute", right: "4.5%", bottom: "13%", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "cursive", fontSize: { xs: ".55rem", md: "1.2rem" }, color: "#0d4d73" }}>Authorized Signatory</Typography>
            <Box sx={{ width: { xs: 65, md: 125 }, height: 1, bgcolor: "#0d4d73", mt: .4 }} />
            <Typography sx={{ mt: .4, fontWeight: 800, fontSize: { xs: "4px", md: "7px" }, letterSpacing: 1, color: "#5e788a" }}>APNA COLLEGE</Typography>
          </Stack>
        </Box>

        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(6,26,53,.28)", backdropFilter: "blur(2.2px)", zIndex: 4 }}>
          <Stack alignItems="center" spacing={1.2} sx={{ px: 2, py: 1.5, borderRadius: 3, background: "rgba(6,26,53,.88)", border: "1px solid rgba(147,197,253,.3)", boxShadow: "0 18px 50px rgba(0,0,0,.35)" }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,.1)", color: "#fff" }}><Lock /></Box>
            <Typography sx={{ color: "#fff", fontWeight: 950, fontSize: { xs: ".9rem", md: "1.15rem" } }}>Certificate Locked</Typography>
            <Typography sx={{ color: "#cbd5e1", fontSize: { xs: ".62rem", md: ".8rem" }, textAlign: "center" }}>Complete the course & required assessment to unlock</Typography>
          </Stack>
        </Box>
      </Box>

      <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
        <Verified sx={{ color: "#60a5fa", fontSize: 18 }} />
        <Typography sx={{ color: "#94a3b8", fontSize: ".82rem" }}>Secure certificate preview • Official certificate remains locked</Typography>
      </Stack>
    </Box>
  );
}
