import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { CampaignOutlined, DeleteOutline, EditOutlined, PersonOutline, Refresh, Search, SendOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { createAdminNotification, deleteAdminNotification, listAdminNotifications, updateAdminNotification } from "../services/adminNotification.service";
import { listAdminUsers } from "../services/adminUser.service";

const TYPES = ["system", "announcement", "course", "course-update", "certificate", "module-unlocked", "purchase", "promotion"];
const emptyForm = { userId: "", title: "", message: "", type: "announcement", link: "" };
const prettyType = (value = "") => value.replaceAll("-", " ").replace(/\b\w/g, (x) => x.toUpperCase());

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [audience, setAudience] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminNotifications({ page, limit: pagination.limit, search, type, audience });
      setItems(data?.notifications || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load notifications."));
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await listAdminUsers({ page: 1, limit: 50, search: userSearch, status: "active", role: "user" });
      setUsers(data?.users || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load students."));
    }
  };

  useEffect(() => { load(1); }, [search, type, audience]);
  useEffect(() => { loadUsers(); }, [userSearch]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setUserSearch("");
  };

  const editNotification = (item) => {
    setEditing(item);
    setForm({
      userId: item.user?.id || "",
      title: item.title || "",
      message: item.message || "",
      type: item.type || "system",
      link: item.link || "",
    });
    setUserSearch(item.user?.email || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    try {
      setSaving(true);
      setError("");
      if (editing) {
        await updateAdminNotification(editing.id, { ...form, userId: form.userId || null });
        setNotice("Notification updated successfully.");
      } else {
        await createAdminNotification({ ...form, userId: form.userId || null });
        setNotice(form.userId ? "Notification sent to the selected user." : "Broadcast notification sent to all users.");
      }
      resetForm();
      await load(1);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save notification."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete notification "${item.title}"?`)) return;
    try {
      setDeleting(item.id);
      setError("");
      await deleteAdminNotification(item.id);
      setNotice("Notification deleted successfully.");
      await load(pagination.page);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete notification."));
    } finally {
      setDeleting("");
    }
  };

  return (
    <Box className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <Box className="mx-auto max-w-7xl">
        <Box className="mb-7">
          <Button onClick={() => { window.location.hash = ""; }} className="mb-2 normal-case text-slate-500">← Back to Courses</Button>
          <Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Notifications</Typography>
          <Typography className="mt-1 text-slate-500">Send global or user-specific notifications, then manage them from one place.</Typography>
        </Box>

        {error && <Alert severity="error" className="mb-4" onClose={() => setError("")}>{error}</Alert>}
        {notice && <Alert severity="success" className="mb-4" onClose={() => setNotice("")}>{notice}</Alert>}

        <Paper elevation={0} className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6">
          <Stack direction="row" spacing={1.5} alignItems="center" className="mb-5">
            <CampaignOutlined className="text-blue-600" />
            <Box>
              <Typography className="font-extrabold">{editing ? "Edit notification" : "Send notification"}</Typography>
              <Typography variant="body2" className="text-slate-500">Leave recipient on Broadcast for everyone, or search and select one student.</Typography>
            </Box>
          </Stack>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TextField size="small" fullWidth label="Search students" placeholder="Name or email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
            <FormControl fullWidth size="small">
              <InputLabel>Recipient</InputLabel>
              <Select label="Recipient" value={form.userId} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}>
                <MenuItem value="">Broadcast — all students</MenuItem>
                {users.map((u) => <MenuItem key={u.id} value={u.id}><Stack direction="row" spacing={1} alignItems="center"><Avatar src={u.avatar} sx={{ width: 28, height: 28 }}>{u.name?.[0]}</Avatar><span>{u.name} · {u.email}</span></Stack></MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>{TYPES.map((v) => <MenuItem key={v} value={v}>{prettyType(v)}</MenuItem>)}</Select>
            </FormControl>
            <TextField size="small" fullWidth label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} inputProps={{ maxLength: 200 }} />
            <TextField size="small" fullWidth label="Optional link" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} inputProps={{ maxLength: 2000 }} />
            <TextField className="lg:col-span-2" fullWidth multiline minRows={4} label="Message" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} inputProps={{ maxLength: 1000 }} helperText={`${form.message.length}/1000`} />
          </div>

          <Stack direction="row" justifyContent="flex-end" spacing={1} className="mt-4">
            {editing && <Button onClick={resetForm}>Cancel edit</Button>}
            <Button variant="contained" startIcon={editing ? <EditOutlined /> : <SendOutlined />} disabled={saving || !form.title.trim() || !form.message.trim()} onClick={save} className="rounded-xl normal-case font-bold">
              {saving ? "Saving…" : editing ? "Update Notification" : form.userId ? "Send to User" : "Send to All Students"}
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={0} className="mb-5 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, message or recipient" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
            <FormControl size="small"><InputLabel>Type</InputLabel><Select label="Type" value={type} onChange={(e) => setType(e.target.value)}><MenuItem value="">All types</MenuItem>{TYPES.map((v) => <MenuItem key={v} value={v}>{prettyType(v)}</MenuItem>)}</Select></FormControl>
            <FormControl size="small"><InputLabel>Audience</InputLabel><Select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)}><MenuItem value="">All</MenuItem><MenuItem value="broadcast">Broadcast</MenuItem><MenuItem value="individual">Individual</MenuItem></Select></FormControl>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} className="rounded-xl normal-case">Refresh</Button>
          </div>
        </Paper>

        <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200">
          {loading ? <Box className="grid min-h-72 place-items-center"><CircularProgress /></Box> : items.length === 0 ? <Box className="grid min-h-72 place-items-center p-8"><CampaignOutlined className="text-slate-300" sx={{ fontSize: 52 }} /><Typography className="mt-2 text-slate-500">No notifications found.</Typography></Box> : <Box className="divide-y divide-slate-100">{items.map((item) => <Box key={item.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><Stack direction="row" spacing={1} alignItems="center" className="mb-2"><Chip size="small" label={prettyType(item.type)} variant="outlined" /><Chip size="small" icon={item.user ? <PersonOutline /> : <CampaignOutlined />} label={item.user ? `${item.user.name} • ${item.user.email}` : "Broadcast • all users"} /></Stack><Typography className="font-bold text-slate-900">{item.title}</Typography><Typography className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message}</Typography>{item.link && <Typography className="mt-2 break-all text-xs text-blue-600">{item.link}</Typography>}<Typography variant="caption" className="mt-3 block text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "—"}</Typography></div><Stack direction="row" spacing={1}><Button size="small" startIcon={<EditOutlined />} onClick={() => editNotification(item)} className="normal-case">Edit</Button><Button color="error" size="small" startIcon={<DeleteOutline />} disabled={deleting === item.id} onClick={() => remove(item)} className="normal-case">Delete</Button></Stack></div></Box>)}</Box>}
          <Box className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} notifications</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
        </Paper>
      </Box>
    </Box>
  );
}
