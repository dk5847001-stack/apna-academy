import { useEffect, useState } from "react";
import {
  Alert, Avatar, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, MenuItem, Paper, Select, Snackbar,
  Stack, TextField, Typography
} from "@mui/material";
import { Block, CheckCircleOutline, LockOpen, Refresh, Search, Security } from "@mui/icons-material";
import {
  activateAdminUser, blockAdminUser, getAdminSecurityDetails,
  listAdminUsers, unblockAdminUser, unfreezeAdminUser
} from "../services/user.service";
import { getApiErrorMessage } from "../services/api";

const statusMeta = {
  active: { label: "Active", color: "success" },
  inactive: { label: "Blocked", color: "default" },
  suspended: { label: "Suspended", color: "warning" },
};

export default function Students() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockReason, setBlockReason] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true); setError("");
      const data = await listAdminUsers({ page: 1, limit: 100, search, status });
      setUsers(data?.users || []); setPagination(data?.pagination || {});
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load users.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [search, status]);

  const runAction = async (user, action, fn, success) => {
    if (busyId) return;
    try {
      setBusyId(user.id); setError("");
      await fn();
      setNotice(success);
      await loadUsers();
    } catch (err) { setError(getApiErrorMessage(err, "Unable to update user account.")); }
    finally { setBusyId(""); }
  };

  const confirmBlock = async () => {
    if (!blockTarget) return;
    const target = blockTarget;
    setBlockTarget(null);
    await runAction(
      target,
      "block",
      () => blockAdminUser(target.id, blockReason.trim()),
      "User blocked successfully."
    );
    setBlockReason("");
  };

  return (
    <BoxWrapper>
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><Typography variant="h4" className="font-extrabold tracking-tight">Users</Typography><Typography className="mt-1 text-slate-500">Manage account access, blocked users and suspended accounts.</Typography></div>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadUsers} disabled={loading} className="rounded-xl normal-case font-bold">Refresh</Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total" value={pagination.total || users.length} />
        <MiniStat label="Active" value={users.filter(x => x.status === "active").length} />
        <MiniStat label="Blocked" value={users.filter(x => x.status === "inactive").length} />
        <MiniStat label="Suspended" value={users.filter(x => x.status === "suspended").length} />
      </div>

      <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <TextField size="small" fullWidth placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
          <Select size="small" value={status} onChange={e => setStatus(e.target.value)} className="min-w-40"><MenuItem value="">All status</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Blocked</MenuItem><MenuItem value="suspended">Suspended</MenuItem></Select>
        </div>

        {loading ? <div className="grid place-items-center py-20"><CircularProgress /></div> : users.length === 0 ? <div className="py-20 text-center"><Typography className="font-bold">No users found</Typography><Typography variant="body2" className="mt-1 text-slate-500">Try changing your search or status filter.</Typography></div> : (
          <div className="divide-y divide-slate-100">
            {users.map(user => {
              const meta = statusMeta[user.status] || statusMeta.active;
              const busy = busyId === user.id;
              const frozen = Boolean(user.securityFrozenAt);
              return (
                <div key={user.id} className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
                  <Avatar src={user.avatar || ""} sx={{ width: 44, height: 44 }}>{user.name?.[0]?.toUpperCase() || "U"}</Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><Typography className="font-bold">{user.name}</Typography><Chip size="small" color={meta.color} label={meta.label} />{frozen && <Chip size="small" color="error" variant="outlined" icon={<Security />} label="Security frozen" />}</div>
                    <Typography variant="body2" className="truncate text-slate-500">{user.email}</Typography>
                    <Typography variant="caption" className="text-slate-400">{user.role === "admin" ? "Administrator" : "Student"} · {user.isEmailVerified ? "Email verified" : "Email not verified"}</Typography>
                  </div>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {user.status === "active" && user.role !== "admin" && <Button size="small" color="error" variant="outlined" startIcon={<Block />} disabled={busy} onClick={() => { setBlockTarget(user); setBlockReason(""); }}>Block</Button>}
                    {user.status === "inactive" && user.blockedAt && <Button size="small" variant="outlined" startIcon={<LockOpen />} disabled={busy} onClick={() => runAction(user, "unblock", () => unblockAdminUser(user.id), "User unblocked successfully.")}>Unblock</Button>}
                    {user.status === "suspended" && frozen && <Button size="small" color="warning" variant="outlined" startIcon={<Security />} disabled={busy} onClick={() => runAction(user, "unfreeze", () => unfreezeAdminUser(user.id), "Security freeze removed. User must sign in again.")}>Security Unfreeze</Button>}
                    {user.status === "suspended" && !frozen && <Button size="small" variant="outlined" startIcon={<CheckCircleOutline />} disabled={busy} onClick={() => runAction(user, "activate", () => activateAdminUser(user.id), "Suspended user activated successfully.")}>Activate</Button>}
                    {busy && <CircularProgress size={22} />}
                  </Stack>
                </div>
              );
            })}
          </div>
        )}
      </Paper>

      <Dialog open={Boolean(blockTarget)} onClose={() => busyId || setBlockTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle className="font-extrabold">Block user?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" className="text-slate-600">This will immediately invalidate the user's active session and prevent sign-in until the account is unblocked.</Typography>
          <TextField fullWidth multiline minRows={3} className="mt-4" label="Block reason (optional)" value={blockReason} onChange={e => setBlockReason(e.target.value)} inputProps={{ maxLength: 500 }} />
        </DialogContent>
        <DialogActions className="p-4"><Button onClick={() => setBlockTarget(null)}>Cancel</Button><Button color="error" variant="contained" onClick={confirmBlock} disabled={Boolean(busyId)}>Block User</Button></DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")}><Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert></Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}><Alert severity="error" onClose={() => setError("")}>{error}</Alert></Snackbar>
    </BoxWrapper>
  );
}

function BoxWrapper({ children }) { return <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">{children}</div></div>; }
function MiniStat({ label, value }) { return <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography variant="h5" className="mt-1 font-extrabold">{value}</Typography></Paper>; }
