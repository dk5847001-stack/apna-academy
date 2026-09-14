import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { Refresh, Search, ShieldOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminUser, listAdminUsers, updateAdminUser } from "../services/adminUser.service";

const statusColor = { active: "success", inactive: "default", suspended: "error" };

export default function Users({ admin }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const data = await listAdminUsers({ page, limit: pagination.limit, search, role, status });
      setUsers(data.users || []);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load users.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [search, role, status]);

  const manage = async (user) => {
    try { setError(""); setSelected(await getAdminUser(user.id)); setOpen(true); }
    catch (err) { setError(getApiErrorMessage(err, "Unable to load user details.")); }
  };

  const requestChange = (field, value) => {
    if (!selected || saving || selected.id === admin?.id || selected[field] === value) return;
    setConfirm({ field, value, label: field === "status" ? "account status" : "role" });
  };

  const change = async () => {
    if (!selected || !confirm || saving) return;
    try {
      setSaving(true); setError("");
      const updated = await updateAdminUser(selected.id, { [confirm.field]: confirm.value });
      setSelected(updated);
      setUsers((items) => items.map((item) => item.id === updated.id ? updated : item));
      setConfirm(null);
    } catch (err) { setError(getApiErrorMessage(err, "Unable to update user.")); }
    finally { setSaving(false); }
  };

  return <Box>
    <Box className="mb-7"><Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Users</Typography><Typography className="mt-1 text-slate-500">Manage platform accounts, roles, verification and account status.</Typography></Box>
    {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}
    <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4 sm:p-5 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3">
        <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
        <FormControl size="small"><InputLabel>Role</InputLabel><Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}><MenuItem value="">All roles</MenuItem><MenuItem value="user">User</MenuItem><MenuItem value="admin">Admin</MenuItem></Select></FormControl>
        <FormControl size="small"><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><MenuItem value="">All status</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem><MenuItem value="suspended">Suspended</MenuItem></Select></FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} className="rounded-xl normal-case">Refresh</Button>
      </div>
    </Paper>
    <Paper elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden">
      {loading ? <Box className="min-h-72 grid place-items-center"><CircularProgress /></Box> : users.length === 0 ? <Box className="min-h-72 grid place-items-center p-8"><Typography className="text-slate-500">No users found.</Typography></Box> : <Box className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["User","Verification","Role","Status","Last login",""] .map((x) => <th key={x} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Stack direction="row" spacing={2} alignItems="center"><Avatar src={user.avatar} className="bg-blue-50 text-blue-700">{user.name?.[0]}</Avatar><Box><Typography className="font-semibold">{user.name || "Unnamed user"}</Typography><Typography variant="body2" className="text-slate-500">{user.email}</Typography></Box></Stack></td><td className="px-5 py-4"><Chip size="small" label={user.isEmailVerified ? "Verified" : "Unverified"} color={user.isEmailVerified ? "success" : "default"} variant="outlined" /></td><td className="px-5 py-4"><Chip size="small" icon={user.role === "admin" ? <ShieldOutlined /> : undefined} label={user.role} variant="outlined" /></td><td className="px-5 py-4"><Chip size="small" label={user.status} color={statusColor[user.status] || "default"} /></td><td className="px-5 py-4 text-sm text-slate-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td><td className="px-5 py-4 text-right"><Button size="small" onClick={() => manage(user)} className="normal-case font-bold">Manage</Button></td></tr>)}</tbody></table></Box>}
      <Box className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} users</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
    </Paper>
    <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm"><DialogTitle className="font-extrabold">Manage User</DialogTitle><DialogContent dividers>{selected && <Stack spacing={3}><Stack direction="row" spacing={2} alignItems="center"><Avatar src={selected.avatar} sx={{ width: 56, height: 56 }} className="bg-blue-50 text-blue-700">{selected.name?.[0]}</Avatar><Box><Typography variant="h6" className="font-bold">{selected.name || "Unnamed user"}</Typography><Typography className="text-slate-500">{selected.email}</Typography></Box></Stack><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FormControl fullWidth><InputLabel>Role</InputLabel><Select label="Role" value={selected.role} disabled={saving || selected.id === admin?.id} onChange={(e) => requestChange("role", e.target.value)}><MenuItem value="user">User</MenuItem><MenuItem value="admin">Admin</MenuItem></Select></FormControl><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={selected.status} disabled={saving || selected.id === admin?.id} onChange={(e) => requestChange("status", e.target.value)}><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem><MenuItem value="suspended">Suspended</MenuItem></Select></FormControl></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Info label="Phone" value={selected.phone || "—"}/><Info label="Verification" value={selected.isEmailVerified ? "Verified" : "Not verified"}/><Info label="Created" value={selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"}/><Info label="Last login" value={selected.lastLoginAt ? new Date(selected.lastLoginAt).toLocaleString() : "Never"}/></div>{selected.id === admin?.id && <Alert severity="info">Your own admin role and status cannot be changed here.</Alert>}</Stack>}</DialogContent><DialogActions><Button onClick={() => setOpen(false)} disabled={saving}>Close</Button></DialogActions></Dialog>
    <Dialog open={Boolean(confirm)} onClose={() => !saving && setConfirm(null)} maxWidth="xs" fullWidth><DialogTitle className="font-extrabold flex items-center gap-2"><WarningAmberOutlined /> Confirm change</DialogTitle><DialogContent><Typography className="text-slate-600">Are you sure you want to change this user's {confirm?.label} to <strong>{confirm?.value}</strong>?</Typography></DialogContent><DialogActions><Button onClick={() => setConfirm(null)} disabled={saving}>Cancel</Button><Button variant="contained" onClick={change} disabled={saving}>{saving ? "Saving..." : "Confirm"}</Button></DialogActions></Dialog>
  </Box>;
}
function Info({ label, value }) { return <Box className="rounded-xl bg-slate-50 border border-slate-100 p-4"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography className="font-semibold mt-1">{value}</Typography></Box>; }
