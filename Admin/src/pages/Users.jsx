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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  AssessmentOutlined,
  BadgeOutlined,
  BookOutlined,
  CheckCircleOutline,
  LoginOutlined,
  PersonAddOutlined,
  Refresh,
  Search,
  ShieldOutlined,
  ShoppingBagOutlined,
  TimelineOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { activateAdminUser, blockAdminUser, getAdminUserDetails, listAdminUsers, suspendAdminUser, unblockAdminUser, unfreezeAdminUser, updateAdminUser } from "../services/adminUser.service";

const statusColor = { active: "success", inactive: "default", suspended: "error" };
const money = (amount, currency = "INR") => {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency || "INR"} ${value.toFixed(2)}`;
  }
};
const dateTime = (value, fallback = "—") => (value ? new Date(value).toLocaleString() : fallback);

const activityMeta = {
  account: { label: "Account", icon: <PersonAddOutlined fontSize="small" /> },
  login: { label: "Login", icon: <LoginOutlined fontSize="small" /> },
  purchase: { label: "Purchase", icon: <ShoppingBagOutlined fontSize="small" /> },
  progress: { label: "Progress", icon: <TimelineOutlined fontSize="small" /> },
  completion: { label: "Completion", icon: <CheckCircleOutline fontSize="small" /> },
  certificate: { label: "Certificate", icon: <WorkspacePremiumOutlined fontSize="small" /> },
};

export default function Users({ admin }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [actionReason, setActionReason] = useState("");

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminUsers({ page, limit: pagination.limit, search, role, status });
      setUsers(data.users || []);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [search, role, status]);

  const manage = async (user) => {
    try {
      setError("");
      setDetailLoading(true);
      setOpen(true);
      setTab(0);
      const data = await getAdminUserDetails(user.id);
      setSelected(data);
    } catch (err) {
      setOpen(false);
      setError(getApiErrorMessage(err, "Unable to load user details."));
    } finally {
      setDetailLoading(false);
    }
  };

  const requestChange = (field, value) => {
    if (!selected?.user || saving || selected.user.id === admin?.id || selected.user[field] === value) return;
    setConfirm({ field, value, label: field === "status" ? "account status" : "role" });
  };

  const change = async () => {
    if (!selected?.user || !confirm || saving) return;
    try {
      setSaving(true);
      setError("");
      let updated;
      if (confirm.action === "block") updated = await blockAdminUser(selected.user.id, actionReason);
      else if (confirm.action === "suspend") updated = await suspendAdminUser(selected.user.id, actionReason);
      else if (confirm.action === "unblock") updated = await unblockAdminUser(selected.user.id);
      else if (confirm.action === "activate") updated = await activateAdminUser(selected.user.id);
      else if (confirm.action === "unfreeze") updated = await unfreezeAdminUser(selected.user.id);
      else updated = await updateAdminUser(selected.user.id, { [confirm.field]: confirm.value });
      setSelected((current) => ({ ...current, user: updated }));
      setUsers((items) => items.map((item) => item.id === updated.id ? updated : item));
      setConfirm(null);
      setActionReason("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update user account."));
    } finally {
      setSaving(false);
    }
  };

  const requestAccountAction = (action) => {
    if (!selected?.user || saving || selected.user.id === admin?.id) return;
    const labels = { block: "block this user", suspend: "suspend this user", unblock: "unblock this user", activate: "activate this user", unfreeze: "remove the security freeze from this user" };
    setActionReason("");
    setConfirm({ action, label: labels[action] || "change this user's account status" });
  };

  const summary = selected?.summary || {};
  const purchaseRows = selected?.purchases || [];
  const progressRows = selected?.progress || [];
  const certificateRows = selected?.certificates || [];
  const activityRows = useMemo(() => Array.isArray(selected?.activity) ? selected.activity.filter((item) => item?.at).sort((a, b) => new Date(b.at) - new Date(a.at)) : [], [selected]);
  const activityLabel = useMemo(() => {
    if (!selected?.user) return "No activity data";
    return selected.user.lastLoginAt ? `Last login ${dateTime(selected.user.lastLoginAt)}` : "No recorded login";
  }, [selected]);

  return <Box>
    <Box className="mb-7">
      <Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Users</Typography>
      <Typography className="mt-1 text-slate-500">Manage platform accounts, roles, verification, learning activity and account status.</Typography>
    </Box>
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
      {loading ? <Box className="min-h-72 grid place-items-center"><CircularProgress /></Box> : users.length === 0 ? <Box className="min-h-72 grid place-items-center p-8"><Typography className="text-slate-500">No users found.</Typography></Box> : <Box className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["User", "Verification", "Role", "Status", "Last login", ""].map((x) => <th key={x} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Stack direction="row" spacing={2} alignItems="center"><Avatar src={user.avatar} className="bg-blue-50 text-blue-700">{user.name?.[0]}</Avatar><Box><Typography className="font-semibold">{user.name || "Unnamed user"}</Typography><Typography variant="body2" className="text-slate-500">{user.email}</Typography></Box></Stack></td><td className="px-5 py-4"><Chip size="small" label={user.isEmailVerified ? "Verified" : "Unverified"} color={user.isEmailVerified ? "success" : "default"} variant="outlined" /></td><td className="px-5 py-4"><Chip size="small" icon={user.role === "admin" ? <ShieldOutlined /> : undefined} label={user.role} variant="outlined" /></td><td className="px-5 py-4"><Chip size="small" label={user.status} color={statusColor[user.status] || "default"} /></td><td className="px-5 py-4 text-sm text-slate-500">{dateTime(user.lastLoginAt, "Never")}</td><td className="px-5 py-4 text-right"><Button size="small" onClick={() => manage(user)} className="normal-case font-bold">Manage</Button></td></tr>)}</tbody></table></Box>}
      <Box className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} users</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
    </Paper>

    <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="lg">
      <DialogTitle className="font-extrabold">User Detail Dashboard</DialogTitle>
      <DialogContent dividers>
        {detailLoading ? <Box className="min-h-96 grid place-items-center"><CircularProgress /></Box> : selected?.user && <Stack spacing={3}>
          <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-white">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center"><Avatar src={selected.user.avatar} sx={{ width: 64, height: 64 }} className="bg-blue-50 text-blue-700">{selected.user.name?.[0]}</Avatar><Box><Typography variant="h6" className="font-extrabold">{selected.user.name || "Unnamed user"}</Typography><Typography className="text-slate-500">{selected.user.email}</Typography><Stack direction="row" spacing={1} className="mt-2" flexWrap="wrap"><Chip size="small" label={selected.user.role} variant="outlined" icon={selected.user.role === "admin" ? <ShieldOutlined /> : undefined} /><Chip size="small" label={selected.user.status} color={statusColor[selected.user.status] || "default"} /><Chip size="small" label={selected.user.isEmailVerified ? "Email verified" : "Email unverified"} color={selected.user.isEmailVerified ? "success" : "default"} variant="outlined" /></Stack></Box></Stack>
              <Box className="text-sm text-slate-500"><Typography variant="body2" className="font-semibold text-slate-700">Activity</Typography>{activityLabel}</Box>
            </Stack>
          </Paper>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <Metric icon={<ShoppingBagOutlined />} label="Purchases" value={summary.purchases ?? 0} />
            <Metric icon={<CheckCircleOutline />} label="Paid" value={summary.paidPurchases ?? 0} />
            <Metric icon={<AssessmentOutlined />} label="Revenue" value={money(summary.revenue)} />
            <Metric icon={<BookOutlined />} label="Started" value={summary.coursesStarted ?? 0} />
            <Metric icon={<CheckCircleOutline />} label="Completed" value={summary.coursesCompleted ?? 0} />
            <Metric icon={<BadgeOutlined />} label="Certificates" value={summary.certificates ?? 0} />
          </div>

          <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <Typography variant="subtitle1" className="font-extrabold">Account actions</Typography>
            <Typography variant="body2" className="mt-1 text-slate-500">Manage this user's access. Buttons stay visible; unavailable actions are disabled.</Typography>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Button fullWidth variant="outlined" color="error" disabled={saving || selected.user.id === admin?.id || selected.user.role === "admin" || selected.user.status !== "active"} onClick={() => requestAccountAction("block")}>Block User</Button>
              <Button fullWidth variant="outlined" color="warning" disabled={saving || selected.user.id === admin?.id || selected.user.role === "admin" || selected.user.status !== "active"} onClick={() => requestAccountAction("suspend")}>Suspend User</Button>
              <Button fullWidth variant="outlined" disabled={saving || selected.user.id === admin?.id || selected.user.status !== "inactive"} onClick={() => requestAccountAction("unblock")}>Unblock User</Button>
              <Button fullWidth variant="outlined" color="success" disabled={saving || selected.user.id === admin?.id || selected.user.status !== "suspended" || Boolean(selected.user.securityFrozenAt)} onClick={() => requestAccountAction("activate")}>Activate User</Button>
              <Button fullWidth variant="outlined" color="warning" disabled={saving || selected.user.id === admin?.id || selected.user.status !== "suspended" || !selected.user.securityFrozenAt} onClick={() => requestAccountAction("unfreeze")}>Security Unfreeze</Button>
            </div>
          </Paper>

          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Overview" />
            <Tab label={`Purchases (${purchaseRows.length})`} />
            <Tab label={`Progress (${progressRows.length})`} />
            <Tab label={`Certificates (${certificateRows.length})`} />
            <Tab icon={<TimelineOutlined fontSize="small" />} iconPosition="start" label={`Activity (${activityRows.length})`} />
          </Tabs>

          {tab === 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Phone" value={selected.user.phone || "—"} />
            <Info label="Created" value={dateTime(selected.user.createdAt)} />
            <Info label="Last login" value={dateTime(selected.user.lastLoginAt, "Never")} />
            <Info label="Valid certificates" value={summary.validCertificates ?? 0} />
            <Info label="Paid revenue" value={money(summary.revenue)} />
            <Info label="Learning completion" value={`${summary.coursesCompleted ?? 0} of ${summary.coursesStarted ?? 0} started courses completed`} />
          </div>}

          {tab === 1 && <DataSection empty="No purchases found.">{purchaseRows.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><Box><Typography className="font-bold">{item.course?.title || "Unknown course"}</Typography><Typography variant="body2" className="text-slate-500">{dateTime(item.purchasedAt)} · {item.purchaseType || "purchase"}</Typography></Box><Stack direction="row" spacing={1} alignItems="center"><Chip size="small" label={item.status || "unknown"} color={item.status === "paid" ? "success" : item.status === "failed" ? "error" : "default"} /><Typography className="font-bold">{money(item.amount, item.currency)}</Typography></Stack></div><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500"><span>Order: {item.razorpayOrderId || "—"}</span><span>Payment: {item.razorpayPaymentId || "—"}</span><span>Expires: {dateTime(item.expiresAt)}</span></div></div>)}</DataSection>}

          {tab === 2 && <DataSection empty="No learning progress found.">{progressRows.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><Box><Typography className="font-bold">{item.course?.title || "Unknown course"}</Typography><Typography variant="body2" className="text-slate-500">Updated {dateTime(item.updatedAt)}</Typography></Box><Stack direction="row" spacing={1} alignItems="center"><Chip size="small" label={item.isCompleted ? "Completed" : "In progress"} color={item.isCompleted ? "success" : "default"} /><Typography className="font-extrabold">{Number(item.overallProgress || 0)}%</Typography></Stack></div><div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(Math.max(Number(item.overallProgress || 0), 0), 100)}%` }} /></div><Typography variant="caption" className="text-slate-500 mt-2 block">Completed videos: {item.completedVideoCount ?? 0} · Completed at: {dateTime(item.completedAt)}</Typography></div>)}</DataSection>}

          {tab === 3 && <DataSection empty="No certificates found.">{certificateRows.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><Box><Typography className="font-bold">{item.course?.title || "Unknown course"}</Typography><Typography variant="body2" className="text-slate-500">Certificate ID: {item.certificateId || "—"}</Typography><Typography variant="caption" className="text-slate-500">Issued {dateTime(item.issueDate)}</Typography></Box><Chip size="small" label={item.isValid ? "Valid" : "Revoked / invalid"} color={item.isValid ? "success" : "error"} icon={item.isValid ? <CheckCircleOutline /> : <WarningAmberOutlined />} /></div><div className="mt-3 flex flex-wrap gap-2">{item.verificationUrl && <Button size="small" variant="outlined" href={item.verificationUrl} target="_blank" rel="noreferrer" className="rounded-lg normal-case">Verify</Button>}{item.certificateUrl && <Button size="small" variant="outlined" href={item.certificateUrl} target="_blank" rel="noreferrer" className="rounded-lg normal-case">Certificate</Button>}</div></div>)}</DataSection>}

          {tab === 4 && <ActivityTimeline rows={activityRows} />}
        </Stack>}
      </DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)} disabled={saving}>Close</Button></DialogActions>
    </Dialog>

    <Dialog open={Boolean(confirm)} onClose={() => !saving && setConfirm(null)} maxWidth="sm" fullWidth>
      <DialogTitle className="font-extrabold flex items-center gap-2"><WarningAmberOutlined /> Confirm account action</DialogTitle>
      <DialogContent dividers>
        <Typography className="text-slate-600">Are you sure you want to <strong>{confirm?.label}</strong>?</Typography>
        {(confirm?.action === "block" || confirm?.action === "suspend") && <TextField fullWidth multiline minRows={3} className="mt-4" label={confirm.action === "suspend" ? "Suspension reason (optional)" : "Block reason (optional)"} value={actionReason} onChange={(e) => setActionReason(e.target.value)} inputProps={{ maxLength: 500 }} />}
      </DialogContent>
      <DialogActions><Button onClick={() => setConfirm(null)} disabled={saving}>Cancel</Button><Button color={confirm?.action === "block" ? "error" : confirm?.action === "suspend" ? "warning" : "primary"} variant="contained" onClick={change} disabled={saving}>{saving ? "Saving..." : "Confirm"}</Button></DialogActions>
    </Dialog>
  </Box>;
}

function Metric({ icon, label, value }) {
  return <Paper elevation={0} className="rounded-xl border border-slate-200 p-3"><Stack direction="row" spacing={1.5} alignItems="center"><Box className="text-blue-600">{icon}</Box><Box className="min-w-0"><Typography variant="caption" className="text-slate-500 block truncate">{label}</Typography><Typography className="font-extrabold truncate">{value}</Typography></Box></Stack></Paper>;
}

function Info({ label, value }) {
  return <Box className="rounded-xl bg-slate-50 border border-slate-100 p-4"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography className="font-semibold mt-1 break-words">{value}</Typography></Box>;
}

function DataSection({ children, empty }) {
  return children?.length ? <Stack spacing={2}>{children}</Stack> : <Box className="rounded-xl border border-dashed border-slate-300 p-10 text-center"><Typography className="text-slate-500">{empty}</Typography></Box>;
}

function ActivityTimeline({ rows }) {
  if (!rows.length) return <Box className="rounded-2xl border border-dashed border-slate-300 p-10 text-center"><TimelineOutlined className="text-slate-300" sx={{ fontSize: 42 }} /><Typography className="mt-2 font-semibold text-slate-600">No recorded activity</Typography><Typography variant="body2" className="mt-1 text-slate-500">User account, login, purchase, progress and certificate events will appear here.</Typography></Box>;

  return <Box className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
    <Stack spacing={0}>
      {rows.map((item, index) => {
        const meta = activityMeta[item.type] || { label: "Activity", icon: <TimelineOutlined fontSize="small" /> };
        return <Stack key={item.id || `${item.type}-${item.at}-${index}`} direction="row" spacing={2} className="relative">
          <Box className="flex flex-col items-center">
            <Box className="w-10 h-10 rounded-full border border-slate-200 bg-white text-blue-600 grid place-items-center shadow-sm shrink-0">{meta.icon}</Box>
            {index < rows.length - 1 && <Box className="w-px flex-1 bg-slate-200 min-h-8" />}
          </Box>
          <Box className="min-w-0 flex-1 pb-6">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography className="font-bold text-slate-900">{item.title || meta.label}</Typography>
                <Chip size="small" label={meta.label} variant="outlined" className="h-6" />
              </Stack>
              <Typography variant="caption" className="text-slate-500 whitespace-nowrap">{dateTime(item.at)}</Typography>
            </Stack>
            <Typography variant="body2" className="mt-1 text-slate-600 break-words">{item.description || "Activity recorded."}</Typography>
          </Box>
        </Stack>;
      })}
    </Stack>
  </Box>;
}
