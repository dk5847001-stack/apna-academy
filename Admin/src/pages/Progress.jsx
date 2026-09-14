import { useEffect, useState } from "react";
import {
  Alert,
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
import { CheckCircleOutline, Refresh, Search, TimelineOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminProgress, listAdminProgress } from "../services/adminProgress.service";

const formatDate = (value) => (value ? new Date(value).toLocaleString("en-IN") : "—");

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

  useEffect(() => { load(1); }, [search, completed]);

  const details = async (row) => {
    try {
      setError("");
      setSelected(await getAdminProgress(row.id));
      setOpen(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load progress details."));
    }
  };

  return (
    <Box>
      <Box className="mb-7">
        <Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Learning Progress</Typography>
        <Typography className="mt-1 text-slate-500">Monitor student learning activity and course completion.</Typography>
      </Box>

      {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} className="mb-5 rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or course" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
          <Stack direction="row" spacing={1}>
            {[['', 'All'], ['true', 'Completed'], ['false', 'In progress']].map(([value, label]) => <Button key={value} size="small" variant={completed === value ? "contained" : "outlined"} onClick={() => setCompleted(value)} className="rounded-xl normal-case">{label}</Button>)}
          </Stack>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} className="rounded-xl normal-case">Refresh</Button>
        </div>
      </Paper>

      <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200">
        {loading ? <Box className="grid min-h-72 place-items-center"><CircularProgress /></Box> : rows.length === 0 ? <Box className="grid min-h-72 place-items-center p-8 text-center"><TimelineOutlined sx={{ fontSize: 52 }} className="text-slate-300"/><Typography className="mt-2 text-slate-500">No progress records found.</Typography></Box> : <Box className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-slate-200 bg-slate-50"><tr>{['Student','Course','Progress','Videos','Last watched','Status',''].map((h) => <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Typography className="font-semibold">{row.user?.name || 'Unknown'}</Typography><Typography variant="body2" className="text-slate-500">{row.user?.email || '—'}</Typography></td><td className="px-5 py-4 font-semibold">{row.course?.title || 'Unknown course'}</td><td className="px-5 py-4"><Box className="min-w-32"><div className="mb-1 flex justify-between text-xs font-bold"><span>{Math.round(row.overallProgress || 0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(Math.max(Number(row.overallProgress || 0), 0), 100)}%` }}/></div></Box></td><td className="px-5 py-4">{row.completedVideoCount || 0}</td><td className="px-5 py-4 text-sm text-slate-500">{row.lastWatchedVideo?.title || '—'}</td><td className="px-5 py-4">{row.isCompleted ? <Chip size="small" color="success" icon={<CheckCircleOutline />} label="Completed"/> : <Chip size="small" variant="outlined" label="In progress"/>}</td><td className="px-5 py-4 text-right"><Button size="small" onClick={() => details(row)} className="normal-case font-bold">Details</Button></td></tr>)}</tbody></table></Box>}
        <Box className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} records</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle className="font-extrabold">Progress Details</DialogTitle><DialogContent dividers>{selected && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Info label="Student" value={selected.user?.name}/><Info label="Email" value={selected.user?.email}/><Info label="Course" value={selected.course?.title}/><Info label="Overall progress" value={`${Math.round(selected.overallProgress || 0)}%`}/><Info label="Completed videos" value={selected.completedVideoCount}/><Info label="Last watched" value={selected.lastWatchedVideo?.title || '—'}/><Info label="Last position" value={`${Math.round(selected.lastWatchedPosition || 0)} sec`}/><Info label="Completed at" value={formatDate(selected.completedAt)}/></div>}</DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Close</Button></DialogActions></Dialog>
    </Box>
  );
}

function Info({ label, value }) { return <Box className="rounded-xl border border-slate-100 bg-slate-50 p-3"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography className="mt-1 break-words font-semibold">{value || '—'}</Typography></Box>; }
