import { useEffect, useState } from "react";
import {
  Alert, Avatar, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, MenuItem, Paper, Select, Snackbar, Stack,
  TextField, Typography
} from "@mui/material";
import { Block, CheckCircleOutline, LockOpen, Refresh, Search, Security, PauseCircleOutline } from "@mui/icons-material";
import {
  activateAdminUser, blockAdminUser, getAdminSecurityDetails,
  listAdminUsers, suspendAdminUser, unblockAdminUser, unfreezeAdminUser
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
  const [manageUser, setManageUser] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionReason, setActionReason] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true); setError("");
      const data = await listAdminUsers({ page: 1, limit: 100, search, status });
      setUsers(data?.users || []); setPagination(data?.pagination || {});
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load users.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [search, status]);

  const runAction = async (user, fn, success) => {
    if (busyId) return;
    try {
      setBusyId(user.id); setError("");
      await fn();
      setNotice(success);
      setManageUser(null);
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update user account."));
    } finally { setBusyId(""); }
  };

  const openAction = (user, type) => {
    setActionTarget(user);
    setActionType(type);
    setActionReason("");
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    const user = actionTarget;
    const type = actionType;
    const reason = actionReason.trim();
    setActionTarget(null);

    if (type === "block") {
      await runAction(user, () => blockAdminUser(user.id, reason), "User blocked successfully.");
    } else if (type === "suspend") {
      await runAction(user, () => suspendAdminUser(user.id, reason), "User suspended successfully.");
    }
    setActionReason("");
  };

  const executeManageAction = async (user, type) => {
    if (type === "block" || type === "suspend") {
      openAction(user, type);
      return;
    }
    if (type === "unblock") {
      await runAction(user, () => unblockAdminUser(user.id), "User unblocked successfully.");
    } else if (type === "activate") {
      await runAction(user, () => activateAdminUser(user.id), "Suspended user activated successfully.");
    } else if (type === "unfreeze") {
      await runAction(user, () => unfreezeAdminUser(user.id), "Security freeze removed. User must sign in again.");
    }
  };

  return (
    <BoxWrapper>
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Typography variant="h4" className="font-extrabold tracking-tight">Users</Typography>
          <Typography className="mt-1 text-slate-500">Manage account access, blocked users and suspended accounts.</Typography>
        </div>
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
          <Select size="small" value={status} onChange={e => setStatus(e.target.value)} className="min-w-40">
            <MenuItem value="">All status</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Blocked</MenuItem><MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </div>

        {loading ? <div className="grid place-items-center py-20"><CircularProgress /></div> : users.length === 0 ? (
          <div className="py-20 text-center"><Typography className="font-bold">No users found</Typography><Typography variant="body2" className="mt-1 text-slate-500">Try changing your search or status filter.</Typography></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map(user => {
              const meta = statusMeta[user.status] || statusMeta.active;
              const frozen = Boolean(user.securityFrozenAt);
              return (
                <div key={user.id} className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
                  <Avatar src={user.avatar || ""} sx={{ width: 44, height: 44 }}>{user.name?.[0]?.toUpperCase() || "U"}</Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Typography className="font-bold">{user.name}</Typography>
                      <Chip size="small" color={meta.color} label={meta.label} />
                      {frozen && <Chip size="small" color="error" variant="outlined" icon={<Security />} label="Security frozen" />}
                    </div>
                    <Typography variant="body2" className="truncate text-slate-500">{user.email}</Typography>
                    <Typography variant="caption" className="text-slate-400">{user.role === "admin" ? "Administrator" : "Student"} · {user.isEmailVerified ? "Email verified" : "Email not verified"}</Typography>
                  </div>
                  <Button variant="contained" size="small" onClick={() => setManageUser(user)} disabled={Boolean(busyId)} className="rounded-xl normal-case font-bold">Manage</Button>
                </div>
              );
            })}
          </div>
        )}
      </Paper>

      <Dialog open={Boolean(manageUser)} onClose={() => !busyId && setManageUser(null)} fullWidth maxWidth="sm">
        {manageUser && (
          <>
            <DialogTitle className="font-extrabold">Manage User</DialogTitle>
            <DialogContent dividers>
              <div className="mb-5 flex items-center gap-3">
                <Avatar src={manageUser.avatar || ""} sx={{ width: 52, height: 52 }}>{manageUser.name?.[0]?.toUpperCase() || "U"}</Avatar>
                <div className="min-w-0">
                  <Typography className="font-extrabold">{manageUser.name}</Typography>
                  <Typography variant="body2" className="truncate text-slate-500">{manageUser.email}</Typography>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Chip size="small" color={statusMeta[manageUser.status]?.color || "default"} label={statusMeta[manageUser.status]?.label || manageUser.status} />
                    {manageUser.role === "admin" && <Chip size="small" variant="outlined" label="Administrator" />}
                    {manageUser.securityFrozenAt && <Chip size="small" color="error" variant="outlined" icon={<Security />} label="Security frozen" />}
                  </div>
                </div>
              </div>

              <Typography variant="subtitle2" className="mb-3 font-extrabold">Account actions</Typography>
              <Stack spacing={1.5}>
                {manageUser.status === "active" && manageUser.role !== "admin" && (
                  <>
                    <Button fullWidth color="error" variant="outlined" startIcon={<Block />} onClick={() => executeManageAction(manageUser, "block")}>Block user</Button>
                    <Button fullWidth color="warning" variant="outlined" startIcon={<PauseCircleOutline />} onClick={() => executeManageAction(manageUser, "suspend")}>Suspend user</Button>
                  </>
                )}
                {manageUser.status === "inactive" && manageUser.blockedAt && (
                  <Button fullWidth variant="outlined" startIcon={<LockOpen />} onClick={() => executeManageAction(manageUser, "unblock")}>Unblock user</Button>
                )}
                {manageUser.status === "suspended" && manageUser.securityFrozenAt && (
                  <Button fullWidth color="warning" variant="outlined" startIcon={<Security />} onClick={() => executeManageAction(manageUser, "unfreeze")}>Security unfreeze & activate</Button>
                )}
                {manageUser.status === "suspended" && !manageUser.securityFrozenAt && (
                  <Button fullWidth variant="outlined" startIcon={<CheckCircleOutline />} onClick={() => executeManageAction(manageUser, "activate")}>Activate suspended user</Button>
                )}
                {manageUser.status === "active" && manageUser.role === "admin" && (
                  <Typography variant="body2" className="rounded-xl bg-slate-50 p-3 text-slate-500">Admin accounts cannot be blocked or suspended from this quick-management flow.</Typography>
                )}
              </Stack>
            </DialogContent>
            <DialogActions className="p-4"><Button onClick={() => setManageUser(null)} disabled={Boolean(busyId)}>Close</Button></DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={Boolean(actionTarget)} onClose={() => !busyId && setActionTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle className="font-extrabold">{actionType === "suspend" ? "Suspend user?" : "Block user?"}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" className="text-slate-600">
            {actionType === "suspend"
              ? "This will immediately end the user's active session. The account can later be activated by an administrator."
              : "This will immediately invalidate the user's active session and prevent sign-in until the account is unblocked."}
          </Typography>
          <TextField fullWidth multiline minRows={3} className="mt-4" label={actionType === "suspend" ? "Suspension reason (optional)" : "Block reason (optional)"} value={actionReason} onChange={e => setActionReason(e.target.value)} inputProps={{ maxLength: 500 }} />
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setActionTarget(null)}>Cancel</Button>
          <Button color={actionType === "suspend" ? "warning" : "error"} variant="contained" onClick={confirmAction} disabled={Boolean(busyId)}>
            {actionType === "suspend" ? "Suspend User" : "Block User"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")}><Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert></Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}><Alert severity="error" onClose={() => setError("")}>{error}</Alert></Snackbar>
    </BoxWrapper>
  );
}

function BoxWrapper({ children }) { return <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">{children}</div></div>; }
function MiniStat({ label, value }) { return <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography variant="h5" className="mt-1 font-extrabold">{value}</Typography></Paper>; }
