import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { CampaignOutlined, DeleteOutline, PersonOutline, Refresh, Search, SendOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { createAdminNotification, deleteAdminNotification, listAdminNotifications } from "../services/adminNotification.service";
import { listAdminUsers } from "../services/adminUser.service";

const TYPES = ["system", "announcement", "course", "course-update", "certificate", "module-unlocked", "purchase", "promotion"];

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ userId: "", title: "", message: "", type: "announcement", link: "" });
  const [userSearch, setUserSearch] = useState("");

  const load = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const data = await listAdminNotifications({ page, limit: pagination.limit, search, type, audience });
      setItems(data.notifications || []);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load notifications.")); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try {
      const data = await listAdminUsers({ page: 1, limit: 100, search: userSearch, status: "active" });
      setUsers(data.users || []);
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load users.")); }
  };

  useEffect(() => { load(1); }, [search, type, audience]);
  useEffect(() => { loadUsers(); }, [userSearch]);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    try {
      setSending(true); setError(""); setNotice("");
      await createAdminNotification({ ...form, userId: form.userId || null });
      setForm({ userId: "", title: "", message: "", type: "announcement", link: "" });
      setNotice(form.userId ? "Notification sent to the selected user." : "Broadcast notification sent to all users.");
      await load(1);
    } catch (err) { setError(getApiErrorMessage(err, "Unable to send notification.")); }
    finally { setSending(false); }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(confirmDelete.id); setError("");
      await deleteAdminNotification(confirmDelete.id);
      setConfirmDelete(null);
      setNotice("Notification deleted successfully.");
      await load(pagination.page);
    } catch (err) { setError(getApiErrorMessage(err, "Unable to delete notification.")); }
    finally { setDeleting(null); }
  };

  return <Box>
    <Box className="mb-7"><Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Notifications</Typography><Typography className="mt-1 text-slate-500">Send announcements to every user or a notification directly to any selected user.</Typography></Box>
    {error && <Alert severity="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
    {notice && <Alert severity="success" className="mb-4" onClose={() => setNotice("")}>{notice}</Alert>}

    <Paper elevation={0} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6 mb-6">
      <Stack direction="row" spacing={1.5} alignItems="center" className="mb-5"><CampaignOutlined className="text-blue-600"/><Box><Typography className="font-extrabold text-slate-950">Send notification</Typography><Typography variant="body2" className="text-slate-500">Choose one user for a private notification, or leave the recipient as Broadcast.</Typography></Box></Stack>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormControl fullWidth size="small"><InputLabel>Recipient</InputLabel><Select label="Recipient" value={form.userId} onChange={(e) => setForm((v) => ({ ...v, userId: e.target.value }))}><MenuItem value=""><Stack direction="row" spacing={1} alignItems="center"><CampaignOutlined fontSize="small"/>Broadcast — all users</Stack></MenuItem>{users.map((user) => <MenuItem key={user.id} value={user.id}><Stack direction="row" spacing={1.5} alignItems="center"><Avatar src={user.avatar} sx={{ width: 28, height: 28 }}>{user.name?.[0]}</Avatar><Box><Typography variant="body2">{user.name}</Typography><Typography variant="caption" className="text-slate-500">{user.email}</Typography></Box></Stack></MenuItem>)}</Select></FormControl>
        <FormControl fullWidth size="small"><InputLabel>Type</InputLabel><Select label="Type" value={form.type} onChange={(e) => setForm((v) => ({ ...v, type: e.target.value }))}>{TYPES.map((value) => <MenuItem key={value} value={value}>{value.replaceAll("-", " ").replace(/\b\w/g, (x) => x.toUpperCase())}</MenuItem>)}</Select></FormControl>
        <TextField size="small" fullWidth label="Title" value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} inputProps={{ maxLength: 200 }} />
        <TextField size="small" fullWidth label="Optional link" placeholder="https://... or app route" value={form.link} onChange={(e) => setForm((v) => ({ ...v, link: e.target.value }))} inputProps={{ maxLength: 2000 }} />
        <TextField className="lg:col-span-2" fullWidth multiline minRows={4} label="Message" value={form.message} onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))} inputProps={{ maxLength: 1000 }} helperText={`${form.message.length}/1000`} />
      </div>
      <Box className="mt-4 flex justify-end"><Button variant="contained" startIcon={<SendOutlined />} disabled={sending || !form.title.trim() || !form.message.trim()} onClick={send} className="rounded-xl px-5 normal-case font-bold">{sending ? "Sending…" : form.userId ? "Send to User" : "Send to All Users"}</Button></Box>
    </Paper>

    <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4 sm:p-5 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3">
        <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, message or user" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
        <FormControl size="small"><InputLabel>Type</InputLabel><Select label="Type" value={type} onChange={(e) => setType(e.target.value)}><MenuItem value="">All types</MenuItem>{TYPES.map((value) => <MenuItem key={value} value={value}>{value.replaceAll("-", " ")}</MenuItem>)}</Select></FormControl>
        <FormControl size="small"><InputLabel>Audience</InputLabel><Select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)}><MenuItem value="">All</MenuItem><MenuItem value="broadcast">Broadcast</MenuItem><MenuItem value="individual">Individual</MenuItem></Select></FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} className="rounded-xl normal-case">Refresh</Button>
      </div>
    </Paper>

    <Paper elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden">
      {loading ? <Box className="min-h-72 grid place-items-center"><CircularProgress /></Box> : items.length === 0 ? <Box className="min-h-72 grid place-items-center p-8"><CampaignOutlined className="text-slate-300" sx={{ fontSize: 52 }}/><Typography className="text-slate-500 mt-2">No notifications found.</Typography></Box> : <Box className="divide-y divide-slate-100">{items.map((item) => <Box key={item.id} className="p-5 hover:bg-slate-50/70"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><Stack direction="row" spacing={1} alignItems="center" className="mb-2"><Chip size="small" label={item.type?.replaceAll("-", " ")} variant="outlined"/><Chip size="small" icon={item.user ? <PersonOutline/> : <CampaignOutlined/>} label={item.user ? `${item.user.name} • ${item.user.email}` : "Broadcast • all users"} className="max-w-full"/></Stack><Typography className="font-bold text-slate-900">{item.title}</Typography><Typography className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message}</Typography>{item.link && <Typography className="mt-2 text-xs text-blue-600 break-all">{item.link}</Typography>}<Typography variant="caption" className="mt-3 block text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "—"}</Typography></div><Button color="error" size="small" startIcon={<DeleteOutline/>} disabled={deleting === item.id} onClick={() => setConfirmDelete(item)} className="shrink-0 self-start rounded-lg normal-case">Delete</Button></div></Box>)}</Box>}
      <Box className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} notifications</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
    </Paper>

    <Dialog open={Boolean(confirmDelete)} onClose={() => !deleting && setConfirmDelete(null)} maxWidth="xs" fullWidth><DialogTitle className="font-extrabold">Delete notification?</DialogTitle><DialogContent dividers><Typography className="text-slate-600">This will permanently remove the notification from the system. Existing users will no longer see it.</Typography>{confirmDelete && <Box className="mt-4 rounded-xl bg-slate-50 p-3"><Typography className="font-bold">{confirmDelete.title}</Typography><Typography variant="body2" className="text-slate-500 mt-1">{confirmDelete.user ? confirmDelete.user.email : "Broadcast"}</Typography></Box>}</DialogContent><DialogActions><Button onClick={() => setConfirmDelete(null)} disabled={Boolean(deleting)}>Cancel</Button><Button color="error" variant="contained" onClick={remove} disabled={Boolean(deleting)}>{deleting ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog>
  </Box>;
}
