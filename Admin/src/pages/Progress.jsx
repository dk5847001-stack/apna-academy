import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutline,
  DownloadOutlined,
  HourglassEmptyOutlined,
  Refresh,
  Search,
  TimelineOutlined,
  TrendingUp,
  VideoLibraryOutlined,
} from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminProgress, listAdminProgress } from "../services/adminProgress.service";

const formatDate = (value) => (value ? new Date(value).toLocaleString("en-IN") : "—");
const clamp = (value) => Math.min(Math.max(Number(value || 0), 0), 100);
const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function Progress() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminProgress({ page, limit: pagination.limit, search, completed });
      setRows(data?.progress || []);
      setPagination(data?.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load progress records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [search, completed]);

  const summary = useMemo(() => {
    const total = rows.length;
    const completedCount = rows.filter((row) => row.isCompleted).length;
    const average = total ? rows.reduce((sum, row) => sum + Number(row.overallProgress || 0), 0) / total : 0;
    const active = rows.filter((row) => row.lastActivityAt && Date.now() - new Date(row.lastActivityAt).getTime() <= 7 * 86400000).length;
    const videos = rows.reduce((sum, row) => sum + Number(row.completedVideoCount || 0), 0);
    return { total, completedCount, average, active, videos };
  }, [rows]);

  const details = async (row) => {
    try {
      setError("");
      setSelected(await getAdminProgress(row.id));
      setOpen(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load progress details."));
    }
  };

  const exportCsv = () => {
    if (!rows.length) return;
    const headers = ["Student", "Email", "Course", "Overall Progress", "Completed Videos", "Total Videos", "Video Completion %", "Last Watched Video", "Watch %", "Status", "Last Activity", "Completed At"];
    const lines = rows.map((row) => [
      row.user?.name,
      row.user?.email,
      row.course?.title,
      `${Math.round(clamp(row.overallProgress))}%`,
      row.completedVideoCount,
      row.totalVideos,
      `${Math.round(clamp(row.videoCompletionPercent))}%`,
      row.lastWatchedVideo?.title,
      `${Math.round(clamp(row.lastWatchedVideo?.watchPercentage))}%`,
      row.isCompleted ? "Completed" : "In progress",
      formatDate(row.lastActivityAt),
      formatDate(row.completedAt),
    ].map(escapeCsv).join(","));
    const blob = new Blob([[headers.map(escapeCsv).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `apnaacademy-progress-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className="p-4 sm:p-6 lg:p-8">
      <Box className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Learning Progress</Typography>
          <Typography className="mt-1 text-slate-500">Monitor student learning activity, watch completion and course outcomes.</Typography>
        </div>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={exportCsv} disabled={!rows.length} className="rounded-xl normal-case">Export CSV</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} disabled={loading} className="rounded-xl normal-case">Refresh</Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<TimelineOutlined />} label="Records on page" value={summary.total} hint={`${pagination.total} total records`} />
        <Metric icon={<TrendingUp />} label="Average progress" value={`${Math.round(summary.average)}%`} hint="Current filtered page" />
        <Metric icon={<CheckCircleOutline />} label="Completed" value={summary.completedCount} hint={summary.total ? `${Math.round((summary.completedCount / summary.total) * 100)}% of page` : "No records"} />
        <Metric icon={<VideoLibraryOutlined />} label="Videos completed" value={summary.videos} hint={`${summary.active} active in last 7 days`} />
      </div>

      <Paper elevation={0} className="mb-5 rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
          <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or course" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[["", "All"], ["true", "Completed"], ["false", "In progress"]].map(([value, label]) => <Button key={value} size="small" variant={completed === value ? "contained" : "outlined"} onClick={() => setCompleted(value)} className="rounded-xl normal-case">{label}</Button>)}
          </Stack>
          <Typography variant="body2" className="self-center text-slate-500">Updated automatically on refresh</Typography>
        </div>
      </Paper>

      <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200">
        {loading ? <Box className="grid min-h-72 place-items-center"><CircularProgress /></Box> : rows.length === 0 ? <Box className="grid min-h-72 place-items-center p-8 text-center"><TimelineOutlined sx={{ fontSize: 52 }} className="text-slate-300"/><Typography className="mt-2 text-slate-500">No progress records found.</Typography><Typography variant="body2" className="mt-1 text-slate-400">Try changing the search or completion filter.</Typography></Box> : <Box className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left"><thead className="border-b border-slate-200 bg-slate-50"><tr>{["Student","Course","Progress","Videos","Last watched","Activity","Status",""] .map((h) => <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={row.user?.avatar} sx={{ width: 36, height: 36 }}>{row.user?.name?.[0]?.toUpperCase() || "U"}</Avatar><div><Typography className="font-semibold">{row.user?.name || "Unknown"}</Typography><Typography variant="body2" className="text-slate-500">{row.user?.email || "—"}</Typography></div></div></td><td className="px-5 py-4 font-semibold">{row.course?.title || "Unknown course"}<Typography variant="caption" display="block" className="text-slate-400">{row.course?.totalModules || 0} modules · {row.totalVideos || 0} videos</Typography></td><td className="px-5 py-4"><Box className="min-w-36"><div className="mb-1 flex justify-between text-xs font-bold"><span>{Math.round(clamp(row.overallProgress))}%</span><span className="text-slate-400">{Math.round(clamp(row.videoCompletionPercent))}% videos</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${clamp(row.overallProgress)}%` }}/></div></Box></td><td className="px-5 py-4"><Typography className="font-semibold">{row.completedVideoCount || 0} / {row.totalVideos || 0}</Typography><Typography variant="caption" className="text-slate-400">completed</Typography></td><td className="max-w-56 px-5 py-4"><Typography className="truncate text-sm font-semibold">{row.lastWatchedVideo?.title || "—"}</Typography><Typography variant="caption" className="text-slate-500">Watch {Math.round(clamp(row.lastWatchedVideo?.watchPercentage))}%</Typography></td><td className="px-5 py-4 text-sm text-slate-500">{formatDate(row.lastActivityAt)}</td><td className="px-5 py-4">{row.isCompleted ? <Chip size="small" color="success" icon={<CheckCircleOutline />} label="Completed"/> : <Chip size="small" variant="outlined" icon={<HourglassEmptyOutlined />} label="In progress"/>}</td><td className="px-5 py-4 text-right"><Button size="small" onClick={() => details(row)} className="normal-case font-bold">Details</Button></td></tr>)}</tbody></table></Box>}
        <Box className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><Typography variant="body2" className="text-slate-500">{pagination.total} records · Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md"><DialogTitle className="font-extrabold">Progress Details</DialogTitle><DialogContent dividers>{selected && <div className="space-y-5"><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Info label="Student" value={selected.user?.name}/><Info label="Email" value={selected.user?.email}/><Info label="Status" value={selected.user?.status || "—"}/><Info label="Course" value={selected.course?.title}/><Info label="Modules" value={selected.course?.totalModules}/><Info label="Videos" value={selected.course?.totalVideos}/></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><ProgressStat label="Overall progress" value={selected.overallProgress}/><ProgressStat label="Video completion" value={selected.videoCompletionPercent}/><ProgressStat label="Current video watch" value={selected.lastWatchedVideo?.watchPercentage}/></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Info label="Completed videos" value={`${selected.completedVideoCount || 0} / ${selected.totalVideos || 0}`}/><Info label="Last watched" value={selected.lastWatchedVideo?.title}/><Info label="Last position" value={`${Math.round(selected.lastWatchedPosition || 0)} sec`}/><Info label="Last activity" value={formatDate(selected.lastActivityAt)}/><Info label="Completed at" value={formatDate(selected.completedAt)}/><Info label="Email verified" value={selected.user?.isEmailVerified ? "Yes" : "No"}/></div></div>}</DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Close</Button></DialogActions></Dialog>
    </Box>
  );
}

function Metric({ icon, label, value, hint }) { return <Paper elevation={0} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between"><div><Typography variant="caption" className="font-bold uppercase tracking-wider text-slate-400">{label}</Typography><Typography variant="h5" className="mt-1 font-extrabold text-slate-950">{value}</Typography><Typography variant="body2" className="mt-1 text-slate-500">{hint}</Typography></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">{icon}</div></div></Paper>; }
function ProgressStat({ label, value }) { const safe = clamp(value); return <Box className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><Typography className="font-bold text-slate-700">{label}</Typography><Typography className="font-extrabold text-slate-950">{Math.round(safe)}%</Typography></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${safe}%` }}/></div></Box>; }
function Info({ label, value }) { return <Box className="rounded-xl border border-slate-100 bg-slate-50 p-3"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography className="mt-1 break-words font-semibold">{value || "—"}</Typography></Box>; }
