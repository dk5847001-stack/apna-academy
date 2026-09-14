import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DownloadOutlined, Refresh, Search, ReceiptLongOutlined } from "@mui/icons-material";
import { getApiErrorMessage } from "../services/api";
import { getAdminPurchase, listAdminPurchases } from "../services/adminPurchase.service";

const statusColor = { paid: "success", pending: "warning", failed: "error", refunded: "default" };
const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";
const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const getExpiry = (expiresAt, paymentStatus) => {
  if (!expiresAt) return { label: "No expiry", color: "default" };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return { label: "Expired", color: "error" };
  if (paymentStatus !== "paid") return { label: "—", color: "default" };
  const days = Math.ceil(diff / 86400000);
  if (days <= 3) return { label: `${days}d left`, color: "error" };
  if (days <= 14) return { label: `${days}d left`, color: "warning" };
  return { label: `${days}d left`, color: "success" };
};

export default function Purchases() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const load = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const data = await listAdminPurchases({ page, limit: pagination.limit, search, status: paymentStatus, purchaseType });
      setItems(data.purchases || data.items || []);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) { setError(getApiErrorMessage(err, "Unable to load purchases.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [search, paymentStatus, purchaseType]);

  const summary = useMemo(() => {
    const paid = items.filter((item) => item.paymentStatus === "paid");
    const revenue = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expiring = items.filter((item) => item.paymentStatus === "paid" && item.expiresAt && new Date(item.expiresAt) > new Date() && new Date(item.expiresAt).getTime() - Date.now() <= 14 * 86400000).length;
    return { paid: paid.length, revenue, expiring };
  }, [items]);

  const exportCsv = () => {
    if (!items.length) return;
    const rows = [
      ["Student", "Email", "Course", "Type", "Amount", "Currency", "Payment Status", "Unlock Mode", "Razorpay Order ID", "Razorpay Payment ID", "Purchased At", "Expires At"],
      ...items.map((item) => [item.user?.name, item.user?.email, item.course?.title, item.purchaseType, item.amount, item.currency, item.paymentStatus, item.unlockMode, item.razorpayOrderId, item.razorpayPaymentId, item.purchasedAt, item.expiresAt]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `apnaacademy-purchases-page-${pagination.page}.csv`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  };

  const openDetails = async (purchase) => {
    try { setError(""); setSelected(await getAdminPurchase(purchase.id)); setDetailsOpen(true); }
    catch (err) { setError(getApiErrorMessage(err, "Unable to load purchase details.")); }
  };

  return <Box>
    <Box className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <Box><Typography variant="h4" className="font-extrabold tracking-tight text-slate-950">Purchases</Typography><Typography className="mt-1 text-slate-500">Monitor course payments, Razorpay transactions and access periods.</Typography></Box>
      <Button variant="contained" startIcon={<DownloadOutlined />} onClick={exportCsv} disabled={!items.length} className="rounded-xl normal-case shadow-none">Export current page</Button>
    </Box>
    {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-5">
      <Paper elevation={0} className="rounded-2xl border border-slate-200 p-5"><Typography variant="body2" className="text-slate-500">Paid on page</Typography><Typography variant="h5" className="font-extrabold mt-1">{summary.paid}</Typography></Paper>
      <Paper elevation={0} className="rounded-2xl border border-slate-200 p-5"><Typography variant="body2" className="text-slate-500">Paid value on page</Typography><Typography variant="h5" className="font-extrabold mt-1">₹{summary.revenue.toLocaleString("en-IN")}</Typography></Paper>
      <Paper elevation={0} className="rounded-2xl border border-slate-200 p-5"><Typography variant="body2" className="text-slate-500">Expiring within 14 days</Typography><Typography variant="h5" className="font-extrabold mt-1">{summary.expiring}</Typography></Paper>
    </div>
    <Paper elevation={0} className="rounded-2xl border border-slate-200 p-4 sm:p-5 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3">
        <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student, course or Razorpay ID" InputProps={{ startAdornment: <Search className="mr-2 text-slate-400" fontSize="small" /> }} />
        <FormControl size="small"><InputLabel>Payment</InputLabel><Select label="Payment" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}><MenuItem value="">All payments</MenuItem><MenuItem value="paid">Paid</MenuItem><MenuItem value="pending">Pending</MenuItem><MenuItem value="failed">Failed</MenuItem><MenuItem value="refunded">Refunded</MenuItem></Select></FormControl>
        <FormControl size="small"><InputLabel>Type</InputLabel><Select label="Type" value={purchaseType} onChange={(e) => setPurchaseType(e.target.value)}><MenuItem value="">All types</MenuItem><MenuItem value="course">Course</MenuItem><MenuItem value="all-access">All access</MenuItem></Select></FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(pagination.page)} className="rounded-xl normal-case">Refresh</Button>
      </div>
    </Paper>
    <Paper elevation={0} className="rounded-2xl border border-slate-200 overflow-hidden">
      {loading ? <Box className="min-h-72 grid place-items-center"><CircularProgress /></Box> : items.length === 0 ? <Box className="min-h-72 grid place-items-center p-8"><ReceiptLongOutlined className="text-slate-300" sx={{ fontSize: 48 }} /><Typography className="text-slate-500 mt-2">No purchases found.</Typography></Box> : <Box className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["Student","Course","Type","Amount","Payment","Purchased","Expiry","Access",""].map((x) => <th key={x} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => { const user = item.user || {}; const course = item.course || {}; const expiry = getExpiry(item.expiresAt, item.paymentStatus); return <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Stack direction="row" spacing={2} alignItems="center"><Avatar src={user.avatar} className="bg-blue-50 text-blue-700">{user.name?.[0]}</Avatar><Box><Typography className="font-semibold">{user.name || "Unknown"}</Typography><Typography variant="body2" className="text-slate-500">{user.email || "—"}</Typography></Box></Stack></td><td className="px-5 py-4"><Typography className="font-semibold">{course.title || "Unknown course"}</Typography></td><td className="px-5 py-4"><Chip size="small" label={item.purchaseType || "course"} variant="outlined" /></td><td className="px-5 py-4 font-bold">₹{Number(item.amount || 0).toLocaleString("en-IN")}</td><td className="px-5 py-4"><Chip size="small" label={item.paymentStatus || "unknown"} color={statusColor[item.paymentStatus] || "default"} /></td><td className="px-5 py-4 text-sm text-slate-500">{formatDate(item.purchasedAt)}</td><td className="px-5 py-4 text-sm text-slate-500">{formatDate(item.expiresAt)}</td><td className="px-5 py-4"><Chip size="small" label={expiry.label} color={expiry.color} variant={expiry.color === "default" ? "outlined" : "filled"} /></td><td className="px-5 py-4 text-right"><Button size="small" onClick={() => openDetails(item)} className="normal-case font-bold">Details</Button></td></tr>; })}</tbody></table></Box>}
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-5 py-4"><Typography variant="body2" className="text-slate-500">{pagination.total} purchases · page {pagination.page} of {pagination.totalPages || 1}</Typography><Stack direction="row" spacing={1}><Button size="small" disabled={pagination.page <= 1 || loading} onClick={() => load(pagination.page - 1)}>Previous</Button><Button size="small" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => load(pagination.page + 1)}>Next</Button></Stack></Box>
    </Paper>
    <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm"><DialogTitle className="font-extrabold">Purchase Details</DialogTitle><DialogContent dividers>{selected && <Stack spacing={2.5}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Info label="Student" value={selected.user?.name || "—"}/><Info label="Email" value={selected.user?.email || "—"}/><Info label="Phone" value={selected.user?.phone || "—"}/><Info label="Course" value={selected.course?.title || "—"}/><Info label="Type" value={selected.purchaseType || "—"}/><Info label="Amount" value={`₹${Number(selected.amount || 0).toLocaleString("en-IN")}`}/><Info label="Currency" value={selected.currency || "INR"}/><Info label="Payment status" value={selected.paymentStatus || "—"}/><Info label="Unlock mode" value={selected.unlockMode || "—"}/><Info label="Razorpay order" value={selected.razorpayOrderId || "—"}/><Info label="Razorpay payment" value={selected.razorpayPaymentId || "—"}/><Info label="Purchased" value={formatDate(selected.purchasedAt)}/><Info label="Expires" value={formatDate(selected.expiresAt)}/></div></Stack>}</DialogContent><DialogActions><Button onClick={() => setDetailsOpen(false)}>Close</Button></DialogActions></Dialog>
  </Box>;
}
function Info({ label, value }) { return <Box className="rounded-xl bg-slate-50 border border-slate-100 p-3"><Typography variant="caption" className="text-slate-500">{label}</Typography><Typography className="font-semibold mt-1 break-words">{value}</Typography></Box>; }
