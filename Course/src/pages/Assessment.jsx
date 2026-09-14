import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Radio, RadioGroup, FormControlLabel, Stack, Typography } from "@mui/material";
import { ArrowBack, CheckCircle, EmojiEvents, Quiz, Replay } from "@mui/icons-material";
import { getCourseBySlug } from "../services/course.service";
import { getStudentAssessment, submitStudentAssessment } from "../services/assessment.service";
import { COURSE_ROUTES } from "../constants/config";

export default function Assessment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const courseResult = await getCourseBySlug(slug);
      const data = courseResult?.course;
      const courseId = data?._id || data?.id;
      if (!courseId) throw new Error("Course information is unavailable.");
      const assessmentResult = await getStudentAssessment(courseId);
      setCourse(data);
      setAssessment(assessmentResult?.assessment || assessmentResult);
      setResult(assessmentResult?.result || null);
      setAnswers({});
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Unable to load assessment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const courseResult = await getCourseBySlug(slug);
        const data = courseResult?.course;
        const courseId = data?._id || data?.id;
        if (!courseId) throw new Error("Course information is unavailable.");
        const assessmentResult = await getStudentAssessment(courseId);
        if (!mounted) return;
        setCourse(data);
        setAssessment(assessmentResult?.assessment || assessmentResult);
        setResult(assessmentResult?.result || null);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e?.message || "Unable to load assessment.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (slug) run();
    return () => { mounted = false; };
  }, [slug]);

  const questions = assessment?.questions || [];
  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const remaining = assessment?.remainingAttempts ?? assessment?.attemptsRemaining ?? 0;
  const passed = result?.passed === true;
  const canRetry = !passed && Number(remaining) > 0;

  const submit = async () => {
    if (submitting) return;
    if (answered !== questions.length) {
      setError(`Please answer all questions. ${questions.length - answered} remaining.`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const courseId = course?._id || course?.id;
      const data = await submitStudentAssessment(courseId, Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })));
      setResult(data?.result || data);
      setAnswers({});
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Unable to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    if (!canRetry) return;
    setResult(null);
    setAnswers({});
    setError("");
  };

  if (loading) return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><Stack alignItems="center" spacing={2}><CircularProgress /><Typography color="text.secondary">Loading assessment...</Typography></Stack></Box>;

  return <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg,#f8fafc,#fff)", py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(COURSE_ROUTES.LEARN(slug))} sx={{ mb: 3, textTransform: "none", fontWeight: 800 }}>Back to Course</Button>
      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 4, overflow: "hidden", boxShadow: "0 18px 50px rgba(15,23,42,.07)" }}>
        <Box sx={{ p: { xs: 3, md: 4 }, background: "linear-gradient(135deg,#eff6ff,#fff)", borderBottom: "1px solid #e5e7eb" }}>
          <Stack direction="row" spacing={2} alignItems="center"><Box sx={{ width: 56, height: 56, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "#dbeafe", color: "#2563eb" }}><Quiz /></Box><Box><Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>{assessment?.title || "Course Mini Test"}</Typography><Typography color="text.secondary">{course?.title || "Course"}</Typography></Box></Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap"><Chip label={`Passing: ${assessment?.passingScore ?? 60}%`} /><Chip label={`${questions.length} Questions`} /><Chip label={`Attempts left: ${remaining}`} /></Stack>
        </Box>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}><Stack spacing={3}>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {!assessment?.questions?.length ? <Alert severity="info">The assessment is not currently available.</Alert> : result ? <Box sx={{ p: { xs: 3, md: 5 }, textAlign: "center", borderRadius: 4, bgcolor: passed ? "#f0fdf4" : "#fff7ed", border: `1px solid ${passed ? "#bbf7d0" : "#fed7aa"}` }}><Box sx={{ width: 70, height: 70, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: passed ? "#dcfce7" : "#ffedd5", color: passed ? "#16a34a" : "#ea580c" }}>{passed ? <EmojiEvents sx={{ fontSize: 40 }} /> : <Replay sx={{ fontSize: 38 }} />}</Box><Typography variant="h4" fontWeight={900}>{passed ? "Assessment Passed" : "Assessment Not Passed"}</Typography><Typography sx={{ mt: 1 }} color="text.secondary">Your score</Typography><Typography variant="h2" fontWeight={950}>{Number(result.score || 0).toFixed(1)}%</Typography><Chip sx={{ mt: 1 }} color={passed ? "success" : "warning"} label={passed ? `Passed • ${result.passingScore ?? assessment?.passingScore ?? 60}% required` : `Need ${result.passingScore ?? assessment?.passingScore ?? 60}% to pass`} />{passed ? <Stack alignItems="center" spacing={1.5} sx={{ mt: 3 }}><CheckCircle color="success" /><Typography color="text.secondary">Assessment passed. Your certificate is now unlocked.</Typography><Button variant="contained" onClick={() => navigate(COURSE_ROUTES.CERTIFICATE(slug))} sx={{ textTransform: "none", fontWeight: 800 }}>Get Certificate</Button></Stack> : <Stack alignItems="center" spacing={1.5} sx={{ mt: 3 }}>{canRetry ? <Button variant="contained" startIcon={<Replay />} onClick={retry} sx={{ textTransform: "none", fontWeight: 800 }}>Retry Assessment ({remaining} left)</Button> : <Typography color="text.secondary">No attempts remain. Please contact support if you need assistance.</Typography>}</Stack>}</Box> : <>{questions.map((q, index) => <Box key={q._id || index} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3 }}><Typography fontWeight={850}>Q{index + 1}. {q.question}</Typography><RadioGroup value={answers[q._id] || ""} onChange={(e) => setAnswers((a) => ({ ...a, [q._id]: e.target.value }))} sx={{ mt: 1 }}>{(q.options || []).map((o) => <FormControlLabel key={o._id} value={o._id} control={<Radio />} label={o.text} sx={{ alignItems: "flex-start" }} />)}</RadioGroup></Box>)}<Divider /><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}><Typography variant="body2" color="text.secondary">Answered {answered} of {questions.length}</Typography><Button variant="contained" onClick={submit} disabled={submitting || !questions.length} sx={{ minHeight: 48, px: 4, borderRadius: 2.5, fontWeight: 850, textTransform: "none" }}>{submitting ? "Submitting..." : "Submit Assessment"}</Button></Stack></>}</Stack></CardContent>
      </Card>
    </Box>
  </Box>;
}
