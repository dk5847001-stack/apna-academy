import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { CheckCircleOutline, OpenInNew, Refresh, Search, VerifiedOutlined, CancelOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminCertificate, listAdminCertificates, updateAdminCertificate } from "../services/adminCertificate.service";

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Certificates() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [validity, setValidity] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const load = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const data = await listAdminCertificates({ page, limit: pagination.limit, search, validity });
      setItems(data.certificates || []);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load certificates.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [search, validity]);

  const showDetails = async (item) => {
    try { setError(""); setSelected(await getAdminCertificate(item.id)); setOpen(true); }
    catch (err) { setError(getApiErrorMessage(err, "Unable to load certificate details.")); }
  };

  const toggleValidity = async (item) => {
    try {
      setSavingId(item.id); setError("");
      const updated = await updateAdminCertificate(item.id, !item.isValid);
      setItems((current) => current.map((row) => row.id === item.id ? updated : row));
      if (selected?.id === item.id) setSelected(updated);
    } catch (err) { setError(getApiErrorMessage(err, "Unable to update certificate.")); }
    finally { setSavingId(null); }
  };

  return <Box>
    <Box className="mb-7"><Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Certificates</Typography><Typography className="mt-1 text-slate-500">Review issued certificates and control their public validity status.</Typography></Box>
    {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}
    <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4 sm:p-5 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_190px_auto] gap-3">
        <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificate ID, student or course" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
        <FormControl size="small"><InputLabel>Validity</InputLabel><Select label="Validity" value={validity} onChange={(e) => setValidity(e.target.value)}><MenuItem value="">All certificates</MenuItem><MenuItem value="valid">Valid</MenuItem><MenuItem value="invalid">Invalid</MenuItem></Select></FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} className="rounded-xl normal-case">Refresh</Button>
      </div>
    </Paper>
    <Paper elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden">
      {loading ? <Box className="min-h-72 grid place-items-center"><CircularProgress /></Box> : items.length === 0 ? <Box className="min-h-72 grid place-items-center p-8"><VerifiedOutlined className="text-slate-300" sx={{ fontSize: 48 }} /><Typography className="text-slate-500 mt-2">No certificates found.</Typography></Box> : <Box className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["Recipient","Course","Certificate ID","Issued","Status","Actions"].map((x) => <th key={x} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Stack direction="row" spacing={2} alignItems="center"><Avatar src={item.user?.avatar} className="bg-blue-50 text-blue-700">{item.recipientName?.[0] || item.user?.name?.[0]}</Avatar><Box><Typography className="font-semibold">{item.recipientName || item.user?.name || "—"}</Typography><Typography variant="body2" className="text-slate-500">{item.user?.email || "—"}</Typography></Box></Stack></td><td className="px-5 py-4 font-semibold">{item.course?.title || "—"}</td><td className="px-5 py-4"><Typography className="font-mono text-sm">{item.certificateId || "—"}</Typography></td><td className="px-5 py-4 text-sm text-slate-500">{formatDate(item.issueDate)}</td><td className="px-5 py-4"><Chip size="small" icon={item.isValid ? <CheckCircleOutline /> : <CancelOutlined />} label={item.isValid ? "Valid" : "Invalid"} color={item.isValid ? "success" : "error"} variant={item.isValid ? "filled" : "outlined"} /></td><td className="px-5 py-4"><Stack direction="row" spacing={1}><Button size="small" onClick={() => showDetails(item)} className="normal-case">Details</Button><Button size="small" color={item.isValid ? "error" : "success"} disabled={savingId === item.id} onClick={() => toggleValidity(item)} className="normal-case">{savingId === item.id ? "Saving…" : item.isValid ? "Invalidate" : "Validate"}</Button></Stack></td></tr>)}</tbody></table></Box>}
      <Box className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} certificates</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
    </Paper>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle className="font-extrabold">Certificate Details</DialogTitle><DialogContent dividers>{selected && <Stack spacing={2.5}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Info label="Recipient" value={selected.recipientName}/><Info label="Student" value={selected.user?.name || "—"}/><Info label="Email" value={selected.user?.email || "—"}/><Info label="Course" value={selected.course?.title || "—"}/><Info label="Certificate ID" value={selected.certificateId}/><Info label="Issue date" value={formatDate(selected.issueDate)}/><Info label="Validity" value={selected.isValid ? "Valid" : "Invalid"}/></div><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>{selected.certificateUrl && <Button fullWidth variant="contained" component="a" href={selected.certificateUrl} target="_blank" rel="noopener noreferrer" startIcon={<OpenInNew />}>Open Certificate</Button>}{selected.verificationUrl && <Button fullWidth variant="outlined" component="a" href={selected.verificationUrl} target="_blank" rel="noopener noreferrer" startIcon={<VerifiedOutlined />}>Verify Certificate</Button>}</Stack></Stack>}</DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Close</Button></DialogActions></Dialog>
  </Box>;
}
function Info({ label, value }) { return <Box className="rounded-xl bg-slate-50 border border-slate-100 p-3"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography className="font-semibold mt-1 break-words">{value || "—"}</Typography></Box>; }
