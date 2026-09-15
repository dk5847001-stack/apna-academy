import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Add, DeleteOutline, EditOutlined, Refresh, Search } from "@mui/icons-material";
import { archiveDsaProblem, createDsaProblem, listDsaProblems, updateDsaProblem } from "../services/dsaAdmin.service";
import { getApiErrorMessage } from "../services/api";

const initial = { title: "", slug: "", description: "", difficulty: "Easy", topics: "", companies: "", patterns: "", constraints: "", hints: "", editorial: "", solution: "", starterCode: "", supportedLanguages: "Java,C++,Python,JavaScript", timeLimitMs: 2000, memoryLimitMb: 256, isPremium: true, status: "DRAFT", order: 1 };
const csv = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
const lines = (value) => String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);
const formOf = (item) => ({
  ...initial,
  ...item,
  topics: Array.isArray(item.topics) ? item.topics.join(", ") : item.topics || "",
  companies: Array.isArray(item.companies) ? item.companies.join(", ") : item.companies || "",
  patterns: Array.isArray(item.patterns) ? item.patterns.join(", ") : item.patterns || "",
  constraints: Array.isArray(item.constraints) ? item.constraints.join("\n") : item.constraints || "",
  hints: Array.isArray(item.hints) ? item.hints.join("\n") : item.hints || "",
  supportedLanguages: Array.isArray(item.supportedLanguages) ? item.supportedLanguages.join(", ") : item.supportedLanguages || initial.supportedLanguages,
  timeLimitMs: item.timeLimitMs ?? initial.timeLimitMs,
  memoryLimitMb: item.memoryLimitMb ?? initial.memoryLimitMb,
  starterCode: item.starterCode && typeof item.starterCode === "object" ? Object.entries(item.starterCode).map(([language, code]) => `${language}: ${code}`).join("\n\n") : item.starterCode || "",
});
const starterCodeMap = (value) => {
  const result = {};
  String(value || "").split(/\n\s*\n/).forEach((block) => {
    const separator = block.indexOf(":");
    if (separator <= 0) return;
    const language = block.slice(0, separator).trim();
    const code = block.slice(separator + 1).trim();
    if (language && code) result[language] = code;
  });
  return result;
};
const body = (form) => ({
  title: form.title.trim(),
  slug: form.slug.trim(),
  description: form.description.trim(),
  difficulty: form.difficulty,
  topics: csv(form.topics),
  companies: csv(form.companies),
  patterns: csv(form.patterns),
  constraints: lines(form.constraints),
  hints: lines(form.hints),
  editorial: form.editorial.trim(),
  solution: form.solution.trim(),
  starterCode: starterCodeMap(form.starterCode),
  supportedLanguages: csv(form.supportedLanguages),
  timeLimitMs: Number(form.timeLimitMs) || 2000,
  memoryLimitMb: Number(form.memoryLimitMb) || 256,
  isPremium: Boolean(form.isPremium),
  status: form.status,
  order: Number(form.order) || 1,
});

export default function DsaProblems() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [search, setSearch] = useState(""), [difficulty, setDifficulty] = useState(""), [status, setStatus] = useState(""), [accessType, setAccessType] = useState(""), [open, setOpen] = useState(false), [editing, setEditing] = useState(null), [form, setForm] = useState(initial), [saving, setSaving] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const load = async () => {
    try { setLoading(true); const data = await listDsaProblems({ page: 1, limit: 100, search, difficulty, status, accessType }); setItems(data?.items || []); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "Unable to load DSA problems.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, difficulty, status, accessType]);
  const save = async () => {
    try { setSaving(true); if (editing) await updateDsaProblem(editing.id || editing._id, body(form)); else await createDsaProblem(body(form)); setOpen(false); setNotice(editing ? "Problem updated successfully." : "Problem created successfully."); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "Unable to save problem.")); }
    finally { setSaving(false); }
  };
  const archive = async (item) => { if (!window.confirm("Archive this DSA problem?")) return; try { await archiveDsaProblem(item.id || item._id); setNotice("Problem archived."); await load(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Unable to archive problem.")); } };
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  return <Box className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} className="mb-6"><div><Typography variant="h4" className="font-extrabold tracking-tight">DSA Problem Management</Typography><Typography className="mt-1 text-slate-500">Create, edit, publish and archive coding problems.</Typography></div><Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({ ...initial, order: items.length + 1 }); setOpen(true); }}>New Problem</Button></Stack>
    <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200"><div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 md:flex-row"><TextField size="small" fullWidth placeholder="Search title, topic or company..." value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} /><TextField size="small" select label="Difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="md:w-40"><MenuItem value="">All</MenuItem><MenuItem value="Easy">Easy</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Hard">Hard</MenuItem></TextField><TextField size="small" select label="Access" value={accessType} onChange={(event) => setAccessType(event.target.value)} className="md:w-40"><MenuItem value="">All</MenuItem><MenuItem value="FREE">Free</MenuItem><MenuItem value="PREMIUM">Premium</MenuItem></TextField><TextField size="small" select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} className="md:w-40"><MenuItem value="">All</MenuItem><MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="REVIEW">Review</MenuItem><MenuItem value="PUBLISHED">Published</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem></TextField><Tooltip title="Refresh"><IconButton onClick={load}><Refresh /></IconButton></Tooltip></div>
      {loading ? <Box className="grid place-items-center py-20"><CircularProgress /></Box> : items.length === 0 ? <Box className="py-20 text-center"><Typography className="font-bold">No DSA problems found</Typography><Typography variant="body2" className="text-slate-400">Create the first problem to start the library.</Typography></Box> : <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id || item._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Typography className="font-extrabold">{item.title}</Typography><Chip size="small" label={item.difficulty || "Easy"} /><Chip size="small" label={item.isPremium ? "Premium" : "Free"} color={item.isPremium ? "primary" : "success"} /><Chip size="small" label={item.status || "DRAFT"} /></div><Typography variant="caption" className="text-slate-400">/{item.slug || "no-slug"} · {(item.topics || []).slice(0, 4).join(" · ")}</Typography></div><Stack direction="row"><Tooltip title="Edit"><IconButton onClick={() => { setEditing(item); setForm(formOf(item)); setOpen(true); }}><EditOutlined /></IconButton></Tooltip><Tooltip title="Archive"><IconButton color="error" onClick={() => archive(item)}><DeleteOutline /></IconButton></Tooltip></Stack></div>)}</div>}
    </Paper>
    <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="md"><DialogTitle>{editing ? "Edit DSA Problem" : "Create DSA Problem"}</DialogTitle><DialogContent dividers><div className="grid gap-4 pt-2 md:grid-cols-2">{[["title", "Title"], ["slug", "Slug"], ["topics", "Topics (comma separated)"], ["companies", "Companies (comma separated)"], ["patterns", "Patterns (comma separated)"], ["supportedLanguages", "Supported languages"]].map(([key, label]) => <TextField key={key} label={label} value={form[key]} onChange={(event) => set(key, event.target.value)} />)}<TextField select label="Difficulty" value={form.difficulty} onChange={(event) => set("difficulty", event.target.value)}><MenuItem value="Easy">Easy</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Hard">Hard</MenuItem></TextField><TextField select label="Status" value={form.status} onChange={(event) => set("status", event.target.value)}><MenuItem value="DRAFT">Draft</MenuItem><MenuItem value="REVIEW">Review</MenuItem><MenuItem value="PUBLISHED">Published</MenuItem><MenuItem value="ARCHIVED">Archived</MenuItem></TextField><TextField label="Order" type="number" value={form.order} onChange={(event) => set("order", event.target.value)} /><TextField label="Time limit (ms)" type="number" value={form.timeLimitMs} onChange={(event) => set("timeLimitMs", event.target.value)} /><TextField label="Memory limit (MB)" type="number" value={form.memoryLimitMb} onChange={(event) => set("memoryLimitMb", event.target.value)} /><TextField label="Constraints (one per line)" multiline minRows={3} value={form.constraints} onChange={(event) => set("constraints", event.target.value)} /><TextField label="Description" multiline minRows={5} className="md:col-span-2" value={form.description} onChange={(event) => set("description", event.target.value)} /><TextField label="Hints (one per line)" multiline minRows={3} value={form.hints} onChange={(event) => set("hints", event.target.value)} /><TextField label="Editorial" multiline minRows={3} value={form.editorial} onChange={(event) => set("editorial", event.target.value)} /><TextField label="Solution" multiline minRows={3} value={form.solution} onChange={(event) => set("solution", event.target.value)} /><TextField label="Starter code (Language: code, blank line between languages)" multiline minRows={8} className="md:col-span-2" value={form.starterCode} onChange={(event) => set("starterCode", event.target.value)} /><label className="md:col-span-2 flex items-center gap-3 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={form.isPremium} onChange={(event) => set("isPremium", event.target.checked)} /> Premium problem (target: 80% of published library)</label></div></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={saving || !form.title.trim() || !form.slug.trim() || !form.description.trim()} onClick={save}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button></DialogActions></Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={3000} onClose={() => setNotice("")}><Alert severity="success">{notice}</Alert></Snackbar><Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}><Alert severity="error">{error}</Alert></Snackbar>
  </Box>;
}
