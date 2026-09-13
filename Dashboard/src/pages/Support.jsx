import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import supportService from "../services/support.service";

const CATEGORY_OPTIONS = [
  ["course", "Course"],
  ["payment", "Payment"],
  ["video", "Video"],
  ["certificate", "Certificate"],
  ["account", "Account"],
  ["other", "Other"],
];

const PRIORITY_OPTIONS = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const STATUS_META = {
  open: { label: "Open", icon: AccessTimeIcon, className: "bg-blue-50 text-blue-700" },
  "in-progress": { label: "In Progress", icon: HourglassEmptyIcon, className: "bg-amber-50 text-amber-700" },
  resolved: { label: "Resolved", icon: CheckCircleOutlineIcon, className: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Closed", icon: CheckCircleOutlineIcon, className: "bg-slate-100 text-slate-600" },
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLabel = (options, value) =>
  options.find(([key]) => key === value)?.[1] || value || "Other";

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.open;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>
      <Icon sx={{ fontSize: 15 }} />
      {meta.label}
    </span>
  );
}

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [form, setForm] = useState({
    subject: "",
    category: "other",
    priority: "medium",
    message: "",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await supportService.getSupportTickets(
        filter === "all" ? {} : { status: filter }
      );
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const openTicket = async (ticketId) => {
    try {
      setDetailLoading(true);
      setDialogOpen(true);
      const ticket = await supportService.getSupportTicket(ticketId);
      setSelectedTicket(ticket);
    } catch (err) {
      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: err?.message || "Unable to load ticket.",
        severity: "error",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.subject.trim().length < 3) {
      setSnackbar({ open: true, message: "Subject must be at least 3 characters.", severity: "error" });
      return;
    }

    if (form.message.trim().length < 10) {
      setSnackbar({ open: true, message: "Please describe your issue in at least 10 characters.", severity: "error" });
      return;
    }

    try {
      setSubmitting(true);
      await supportService.createSupportTicket({
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        message: form.message.trim(),
      });

      setForm({ subject: "", category: "other", priority: "medium", message: "" });
      setDialogOpen(false);
      setSnackbar({ open: true, message: "Support ticket created successfully.", severity: "success" });
      await loadTickets();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to create support ticket.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in-progress").length,
      resolved: tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length,
    };
  }, [tickets]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <SupportAgentIcon sx={{ fontSize: 28 }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Student Support</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">How can we help?</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Create a support ticket and track your requests from one place. Our team can reply and update the ticket status.
                </p>
              </div>
            </div>

            <Button
              variant="contained"
              size="medium"
              startIcon={<SendIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 800,
                px: 2.25,
                py: 1,
                minHeight: 42,
                minWidth: { md: 160 },
                alignSelf: { xs: "flex-start", md: "center" },
                whiteSpace: "nowrap",
              }}
            >
              Create Ticket
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total Tickets", stats.total, "text-slate-900"],
            ["Open", stats.open, "text-blue-700"],
            ["In Progress", stats.inProgress, "text-amber-700"],
            ["Resolved", stats.resolved, "text-emerald-700"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Your Support Tickets</h2>
              <p className="mt-1 text-xs text-slate-500">View ticket details, priority and admin replies.</p>
            </div>
            <Select
              size="small"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              sx={{ minWidth: 145, borderRadius: "10px" }}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <CircularProgress size={30} />
            </div>
          ) : error ? (
            <div className="p-5">
              <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadTickets}>Retry</Button>}>
                {error}
              </Alert>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
              <ConfirmationNumberOutlinedIcon sx={{ fontSize: 48, color: "#94a3b8" }} />
              <h3 className="mt-4 text-lg font-extrabold text-slate-900">No support tickets yet</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">If you need help with a course, payment, video, certificate or account, create a ticket and our team will take it from there.</p>
              <Button variant="outlined" onClick={() => setDialogOpen(true)} sx={{ mt: 3, borderRadius: "10px", textTransform: "none", fontWeight: 800 }}>
                Create your first ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => openTicket(ticket.id)}
                  className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-slate-50 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <Chip label={getLabel(CATEGORY_OPTIONS, ticket.category)} size="small" variant="outlined" />
                      <Chip label={`${ticket.priority?.[0]?.toUpperCase() || "M"}${ticket.priority?.slice(1) || "edium"} priority`} size="small" variant="outlined" />
                    </div>
                    <h3 className="mt-2 truncate text-sm font-extrabold text-slate-900 sm:text-base">{ticket.subject}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{ticket.message}</p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end">
                    <span className="text-[11px] font-semibold text-slate-400">{formatDate(ticket.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">View <VisibilityOutlinedIcon sx={{ fontSize: 16 }} /></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => !submitting && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: 1.5,
            width: "calc(100% - 24px)",
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        {selectedTicket && !detailLoading ? (
          <>
            <DialogTitle sx={{ px: 3, py: 2, fontWeight: 800 }}>Support Ticket</DialogTitle>
            <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedTicket.status} />
                  <Chip label={getLabel(CATEGORY_OPTIONS, selectedTicket.category)} size="small" variant="outlined" />
                  <Chip label={selectedTicket.priority || "medium"} size="small" variant="outlined" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedTicket.subject}</h3>
                  <p className="mt-1 text-xs text-slate-400">Created {formatDate(selectedTicket.createdAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedTicket.message}</p>
                </div>
                <Divider />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Reply</p>
                  {selectedTicket.adminReply ? (
                    <div className="mt-2 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedTicket.adminReply}</p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">Replied {formatDate(selectedTicket.repliedAt)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No admin reply yet. Your ticket is in the support queue.</p>
                  )}
                </div>
              </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5 }}>
              <Button onClick={() => { setSelectedTicket(null); setDialogOpen(false); }} sx={{ textTransform: "none", fontWeight: 700 }}>Close</Button>
            </DialogActions>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogTitle sx={{ px: 3, py: 2, fontWeight: 800 }}>Create Support Ticket</DialogTitle>
            <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
              <div className="space-y-3.5">
                <TextField
                  fullWidth
                  size="small"
                  label="Subject"
                  placeholder="e.g. Payment completed but course is locked"
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  inputProps={{ maxLength: 200 }}
                  required
                /><br/><br/>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Priority"
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  >
                    {PRIORITY_OPTIONS.map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                  </TextField>
                </div>

                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  label="Describe your issue"
                  placeholder="Please include useful details so our support team can help you faster."
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  inputProps={{ maxLength: 5000 }}
                  required
                />

                <br/><br/>
                <Alert severity="info" sx={{ py: 0.25, alignItems: "center" }}>
                  You can track the ticket status and any admin reply from this page.
                </Alert>
              </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5, gap: 0.5 }}>
              <Button
                type="button"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                size="medium"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 800,
                  minHeight: 40,
                  px: 2,
                }}
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogActions>
          </form>
        )}

        {detailLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <CircularProgress size={30} />
          </div>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        message={snackbar.message}
      />
    </div>
  );
}
