import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Cancel,
  CheckCircle,
  Verified,
  WorkspacePremium,
} from "@mui/icons-material";

import { DASHBOARD_URL } from "../constants/config";
import { verifyCertificate } from "../services/certificate.service";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function CertificateVerify() {
  const { certificateId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await verifyCertificate(certificateId);
        if (mounted) setResult(data);
      } catch (requestError) {
        console.error("Certificate verification error:", requestError);
        if (!mounted) return;
        setResult({ valid: false, certificate: null });
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to verify this certificate right now."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (certificateId) verify();
    else {
      setResult({ valid: false, certificate: null });
      setError("Certificate ID is missing.");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [certificateId]);

  const certificate = result?.certificate;
  const valid = Boolean(result?.valid && certificate);

  const goDashboard = () => {
    window.location.assign(DASHBOARD_URL);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Verifying certificate...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", py: { xs: 4, md: 7 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box sx={{ width: 68, height: 68, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: valid ? "#dcfce7" : "#fee2e2", color: valid ? "#16a34a" : "#dc2626" }}>
            {valid ? <Verified sx={{ fontSize: 40 }} /> : <Cancel sx={{ fontSize: 40 }} />}
          </Box>

          <Box>
            <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={3}>ApnaAcademy</Typography>
            <Typography variant="h3" fontWeight={900} sx={{ mt: 0.5, fontSize: { xs: "2rem", sm: "2.7rem" }, letterSpacing: "-0.03em" }}>
              Certificate Verification
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Public verification for an ApnaAcademy certificate.
            </Typography>
          </Box>

          {error && <Alert severity={valid ? "warning" : "error"} sx={{ width: "100%", borderRadius: 3 }}>{error}</Alert>}

          <Card elevation={0} sx={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: { xs: 3, md: 4 }, boxShadow: "0 18px 55px rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
            <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3, bgcolor: valid ? "#f0fdf4" : "#fef2f2", borderBottom: "1px solid #e5e7eb" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                {valid ? <CheckCircle color="success" sx={{ fontSize: 36 }} /> : <Cancel color="error" sx={{ fontSize: 36 }} />}
                <Box sx={{ textAlign: "left" }}>
                  <Typography fontWeight={900} variant="h6">{valid ? "Certificate is Valid" : "Certificate could not be verified"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {valid ? "This certificate record matches ApnaAcademy verification data." : "The certificate ID is invalid, unavailable, or could not be verified."}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {valid ? (
                <Stack spacing={3}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Box sx={{ width: 58, height: 58, flexShrink: 0, borderRadius: 3, bgcolor: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <WorkspacePremium sx={{ fontSize: 34 }} />
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" color="text.secondary">Certificate Holder</Typography>
                      <Typography variant="h5" fontWeight={900}>{certificate?.recipientName || "—"}</Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">Course</Typography>
                      <Typography fontWeight={800} sx={{ mt: 0.5 }}>{certificate?.course?.title || certificate?.courseTitle || "—"}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">Issue Date</Typography>
                      <Typography fontWeight={800} sx={{ mt: 0.5 }}>{formatDate(certificate?.issueDate)}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2.5, gridColumn: { sm: "1 / -1" } }}>
                      <Typography variant="caption" color="text.secondary">Certificate ID</Typography>
                      <Typography fontWeight={800} sx={{ mt: 0.5, wordBreak: "break-word" }}>{certificate?.certificateId || certificateId}</Typography>
                    </Box>
                  </Box>

                  <Chip icon={<Verified />} label="Verified by ApnaAcademy" color="success" variant="outlined" sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, fontWeight: 800 }} />
                </Stack>
              ) : (
                <Stack spacing={2} alignItems="center" textAlign="center" py={2}>
                  <Typography color="text.secondary">No valid certificate details are available for this ID.</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>{certificateId || "Missing certificate ID"}</Typography>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Button startIcon={<ArrowBack />} variant="outlined" onClick={goDashboard} sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2.5, px: 3 }}>
            Go to ApnaAcademy Dashboard
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
