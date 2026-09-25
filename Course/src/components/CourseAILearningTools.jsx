import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography
} from "@mui/material";
import { AutoAwesome, Code, EventNote, Quiz, Summarize, Psychology } from "@mui/icons-material";
import {
  explainTopic, generatePracticeQuiz, generateStudyPlan, reviewCode, summarizeLesson
} from "../services/aiLearning.service";

const tools = [
  { key: "explain", label: "Explain", icon: Psychology },
  { key: "summary", label: "Summary", icon: Summarize },
  { key: "quiz", label: "Practice Quiz", icon: Quiz },
  { key: "plan", label: "Study Plan", icon: EventNote },
  { key: "code", label: "Code Review", icon: Code },
];

export default function CourseAILearningTools({ courseId = "", courseTitle = "", videoId = "", moduleId = "" }) {
  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState("explain");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [days, setDays] = useState(7);
  const [minutes, setMinutes] = useState(60);
  const [difficulty, setDifficulty] = useState("mixed");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const active = useMemo(() => tools.find((item) => item.key === tool) || tools[0], [tool]);

  const reset = (nextTool = tool) => {
    setTool(nextTool);
    setInput("");
    setResult(null);
    setError("");
  };

  const run = async () => {
    if (!courseId || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let data;
      if (tool === "explain") {
        if (!input.trim()) throw new Error("Enter a topic to explain.");
        data = await explainTopic(courseId, { topic: input.trim(), moduleId: moduleId || undefined, videoId: videoId || undefined });
      } else if (tool === "summary") {
        data = await summarizeLesson(courseId, { moduleId: moduleId || undefined, videoId: videoId || undefined });
      } else if (tool === "quiz") {
        data = await generatePracticeQuiz(courseId, { count: 5, difficulty, moduleId: moduleId || undefined, videoId: videoId || undefined });
      } else if (tool === "plan") {
        data = await generateStudyPlan(courseId, { goals: input.trim() || undefined, days, dailyMinutes: minutes });
      } else {
        if (!input.trim()) throw new Error("Paste code for review.");
        data = await reviewCode(courseId, { language, code: input.trim(), videoId: videoId || undefined, moduleId: moduleId || undefined });
      }
      setResult(data);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || "AI learning feature is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<AutoAwesome />}
        variant="outlined"
        sx={{
          position: "fixed", left: { xs: 12, sm: 20, md: 28 }, bottom: { xs: 14, sm: 20, md: 28 },
          zIndex: 50, borderRadius: 999, px: 1.8, py: 1, textTransform: "none", fontWeight: 900,
          color: "#93c5fd", borderColor: "#334155", backgroundColor: "#0f172acc", backdropFilter: "blur(14px)"
        }}
      >
        Learning Tools
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <AutoAwesome color="primary" />
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={950}>AI Learning Tools</Typography>
              <Typography variant="caption" color="text.secondary">{courseTitle || "Your course"}</Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 2 }}>
            {tools.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.key} onClick={() => reset(item.key)} startIcon={<Icon />} variant={tool === item.key ? "contained" : "outlined"} sx={{ flexShrink: 0, textTransform: "none", fontWeight: 850 }}>
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            AI uses only the course material you are currently authorized to access. Locked lessons are not used.
          </Alert>

          {tool === "explain" && (
            <TextField fullWidth multiline minRows={3} value={input} onChange={(e) => setInput(e.target.value)} label="What should AI explain?" placeholder="e.g. Explain binary search step by step." />
          )}

          {tool === "summary" && (
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "action.hover" }}>
              <Typography fontWeight={850}>Current lesson summary</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                {videoId ? "The current lesson will be summarized." : moduleId ? "The current module will be summarized." : "Open an authorized lesson and try again."}
              </Typography>
            </Box>
          )}

          {tool === "quiz" && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select value={difficulty} label="Difficulty" onChange={(e) => setDifficulty(e.target.value)}>
                  <MenuItem value="easy">Easy</MenuItem><MenuItem value="mixed">Mixed</MenuItem><MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">A temporary 5-question practice quiz will be generated. It does not affect your official assessment.</Typography>
            </Stack>
          )}

          {tool === "plan" && (
            <Stack spacing={2}>
              <TextField fullWidth multiline minRows={2} value={input} onChange={(e) => setInput(e.target.value)} label="Your goal (optional)" placeholder="e.g. Finish the next modules and prepare for revision." />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth type="number" label="Days" value={days} onChange={(e) => setDays(Math.min(30, Math.max(1, Number(e.target.value) || 1)))} />
                <TextField fullWidth type="number" label="Minutes/day" value={minutes} onChange={(e) => setMinutes(Math.min(360, Math.max(15, Number(e.target.value) || 15)))} />
              </Stack>
            </Stack>
          )}

          {tool === "code" && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
                  <MenuItem value="javascript">JavaScript</MenuItem><MenuItem value="java">Java</MenuItem><MenuItem value="python">Python</MenuItem><MenuItem value="cpp">C++</MenuItem><MenuItem value="typescript">TypeScript</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth multiline minRows={10} value={input} onChange={(e) => setInput(e.target.value)} label="Paste code" placeholder="Paste the code you want AI to review." inputProps={{ maxLength: 10000 }} />
            </Stack>
          )}

          {loading && <Typography sx={{ mt: 2 }} color="primary">AI is working…</Typography>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          {result && (
            <Box sx={{ mt: 2, p: { xs: 2, md: 2.5 }, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography fontWeight={950}>{active.label} Result</Typography>
                <Chip size="small" label={result.model || "AI"} />
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {tool === "quiz" && Array.isArray(result.questions) ? (
                <Stack spacing={2}>
                  {result.questions.map((question, index) => (
                    <Box key={index} sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                      <Typography fontWeight={850}>Q{index + 1}. {question.question}</Typography>
                      <Stack spacing={.5} sx={{ mt: 1 }}>
                        {question.options.map((option, optionIndex) => (
                          <Typography key={optionIndex} variant="body2">
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </Typography>
                        ))}
                      </Stack>
                      <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 1 }}>
                        Answer: {String.fromCharCode(65 + question.correctOptionIndex)} · {question.explanation}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75, fontSize: ".9rem" }}>
                  {result.text || "No result returned."}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>Close</Button>
          <Button onClick={run} disabled={loading || (tool === "summary" && !videoId && !moduleId)} variant="contained" startIcon={<AutoAwesome />} sx={{ textTransform: "none", fontWeight: 900 }}>
            {loading ? "Working…" : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
