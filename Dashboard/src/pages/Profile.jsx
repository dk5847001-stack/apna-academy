import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Button, Chip, CircularProgress, Divider, Snackbar, TextField } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import profileService from "../services/profile.service";
import dashboardService from "../services/dashboard.service";
import { useAuth } from "../context/AuthContext";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const dashboardData = await dashboardService.getDashboard();
        if (!mounted) return;
        const profileData = await profileService.getProfile();
        if (!mounted) return;
        setProfile(profileData);
        setForm({ name: profileData?.name || "", phone: profileData?.phone || "", avatar: profileData?.avatar || "" });
        setEnrolledCourses(dashboardData?.enrolledCourses || []);
        setCertificates(dashboardData?.certificates || []);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || err?.message || "Unable to load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const displayUser = profile || user || {};
  const initials = useMemo(() => getInitials(displayUser.name), [displayUser.name]);

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      setForm({ name: updated?.name || "", phone: updated?.phone || "", avatar: updated?.avatar || "" });
      setNotice("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><CircularProgress size={34} /></div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-7">
        <p className="text-sm font-bold text-blue-600">Account</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage your student information and review your account status.</p>
      </div>

      {error && <Alert severity="error" className="mb-5" onClose={() => setError("")}>{error}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar src={displayUser.avatar || ""} alt={displayUser.name || "Student"} sx={{ width: 84, height: 84, fontSize: 25, fontWeight: 800, bgcolor: "#dbeafe", color: "#1d4ed8" }}>{initials}</Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{displayUser.name || "Student"}</h2>
                {displayUser.status === "active" && <Chip size="small" icon={<CheckCircleOutlineIcon />} label="Active" color="success" variant="outlined" />}
              </div>
              <p className="mt-1 break-all text-sm text-slate-500">{displayUser.email || "—"}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">Member since {formatDate(displayUser.createdAt)}</p>
            </div>
          </div>
          <Divider className="my-7" />
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <p className="mb-4 text-sm font-extrabold text-slate-900">Personal information</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Full name" value={form.name} onChange={handleChange("name")} fullWidth required inputProps={{ maxLength: 100 }} InputProps={{ startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: "#94a3b8" }} /> }} />
                <TextField label="Phone number" value={form.phone} onChange={handleChange("phone")} fullWidth inputProps={{ maxLength: 30 }} InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} /> }} />
              </div>
            </div>
            <TextField label="Avatar URL" value={form.avatar} onChange={handleChange("avatar")} fullWidth placeholder="https://example.com/avatar.jpg" helperText="Optional. Use a trusted HTTPS image URL." />
            <div className="flex justify-end pt-1"><Button type="submit" variant="contained" disabled={saving} sx={{ borderRadius: "12px", px: 3, py: 1.25, textTransform: "none", fontWeight: 800 }}>{saving ? "Saving…" : "Save changes"}</Button></div>
          </form>
        </section>

        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><EmailOutlinedIcon /></div><div><h3 className="text-sm font-extrabold text-slate-900">Email verification</h3><p className="text-xs text-slate-500">Your login email</p></div></div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"><span className="min-w-0 truncate text-xs font-semibold text-slate-600">{displayUser.email || "—"}</span><Chip size="small" label={displayUser.isEmailVerified ? "Verified" : "Unverified"} color={displayUser.isEmailVerified ? "success" : "warning"} variant="outlined" /></div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><WorkspacePremiumOutlinedIcon /></div><div><h3 className="text-sm font-extrabold text-slate-900">Certificates</h3><p className="text-xs text-slate-500">Issued to your account</p></div></div>
            <p className="mt-5 text-3xl font-extrabold text-slate-900">{certificates.length}</p>
            <p className="mt-1 text-xs text-slate-500">{certificates.length ? "Your achievements are available in Certificates." : "Complete an eligible course to earn a certificate."}</p>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><LockOutlinedIcon /></div><div><h3 className="text-sm font-extrabold text-slate-900">Account security</h3><p className="text-xs text-slate-500">Protected authentication session</p></div></div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Authentication is handled securely by the platform. Your password and authentication token are never shown here.</p>
          </section>
        </div>
      </div>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="text-base font-extrabold text-slate-900">Learning overview</h2><p className="mt-1 text-sm text-slate-500">Your enrolled courses are managed from My Courses.</p></div><Chip label={`${enrolledCourses.length} enrolled`} variant="outlined" color="primary" /></div></section>
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")} message={notice} />
    </div>
  );
}