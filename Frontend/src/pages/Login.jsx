import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  CheckCircle,
  Email,
  Lock,
  Security,
  School,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import api from "../services/api";

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5175";
const getDashboardUrl = () => DASHBOARD_URL.replace(/\/+$/, "");

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") return "Unable to connect to the server. Please make sure the backend is running.";
  if (status === 401) return data?.message || "Invalid email or password.";
  if (status === 403) return data?.message || "Your account is not active.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  return data?.message || data?.error?.message || error?.message || "Unable to login. Please try again.";
};

export default function Login() {
  const location = useLocation();
  const authCheckStarted = useRef(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getRedirectPath = () => {
    const redirect = new URLSearchParams(location.search).get("redirect");
    return redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";
  };

  useEffect(() => {
    if (authCheckStarted.current) return;
    authCheckStarted.current = true;

    const verifyExistingSession = async () => {
      try {
        const response = await api.get("/auth/me");
        if (!response?.data?.data) throw new Error("Invalid authentication response.");
        window.location.replace(`${getDashboardUrl()}${getRedirectPath()}`);
      } catch {
        setCheckingAuth(false);
      }
    };

    verifyExistingSession();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const email = formData.email.trim().toLowerCase();
    if (!email) return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (!formData.password) return setError("Please enter your password.");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/login", { email, password: formData.password });
      const user = response?.data?.data?.user;
      if (!user) throw new Error("Login succeeded, but the server returned an invalid user response.");

      setSuccess("Login successful. Opening your dashboard...");
      window.setTimeout(() => window.location.replace(`${getDashboardUrl()}${getRedirectPath()}`), 500);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-white px-4">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-[0_18px_50px_-24px_rgba(37,99,235,0.65)]"><School sx={{ fontSize: 28 }} /></div>
          <CircularProgress size={22} thickness={4} className="!text-blue-600" />
          <Typography component="p" className="!text-sm !font-medium !text-slate-500">Checking your account...</Typography>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-white px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-50/90 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-indigo-50/70 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[420px] w-[420px] rounded-full bg-slate-100/80 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-[1180px] items-center justify-center">
        <section className="w-full max-w-[500px]">
          <div className="mb-7 flex flex-col items-center text-center sm:mb-8">
            <div className="relative mb-5"><div className="absolute inset-0 rounded-[20px] bg-blue-600/15 blur-xl" /><div className="relative flex h-[62px] w-[62px] items-center justify-center rounded-[20px] border border-white bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_20px_45px_-18px_rgba(37,99,235,0.65)] ring-8 ring-white"><School sx={{ fontSize: 30 }} /></div></div>
            <Typography component="p" className="!text-[21px] !font-black !tracking-[-0.025em] !text-slate-950">ApnaAcademy</Typography>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400"><span className="h-px w-5 bg-slate-200" />Learn • Build • Grow<span className="h-px w-5 bg-slate-200" /></div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/90 bg-white/95 p-1 shadow-[0_35px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent" />
            <div className="rounded-[26px] border border-slate-100 bg-white px-5 py-7 sm:px-9 sm:py-9">
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-blue-700"><Security sx={{ fontSize: 15 }} />Secure sign in</div>
                  <div className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Protected</div>
                </div>
                <Typography component="h1" className="!text-[32px] !font-black !leading-[1.08] !tracking-[-0.035em] !text-slate-950 sm:!text-[36px]">Welcome back</Typography>
                <Typography component="p" className="!mt-3 !max-w-md !text-[14px] !leading-6 !text-slate-500">Sign in to continue learning and access your ApnaAcademy dashboard.</Typography>
              </div>

              {error && <Alert severity="error" variant="outlined" onClose={() => setError("")} className="!mb-5 !rounded-2xl !border-red-200 !bg-red-50/40 !text-sm">{error}</Alert>}
              {success && <Alert severity="success" variant="outlined" className="!mb-5 !rounded-2xl !border-emerald-200 !bg-emerald-50/40 !text-sm">{success}</Alert>}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <TextField fullWidth id="email" name="email" type="email" label="Email address" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading} autoComplete="email" autoFocus required InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Email className="!text-slate-400" /></InputAdornment> }} sx={{ "& .MuiInputLabel-root": { color: "#64748b", fontWeight: 600 }, "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" }, "& .MuiOutlinedInput-root": { minHeight: 56, borderRadius: "14px", backgroundColor: "#ffffff" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" }, "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: 1.5 } }} />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-400">Use your verified account credentials</span>
                  <Link to="/forgot-password" className="shrink-0 text-sm font-extrabold text-blue-600 transition-colors hover:text-blue-700 hover:underline">Forgot password?</Link>
                </div>

                <TextField fullWidth id="password" name="password" type={showPassword ? "text" : "password"} label="Password" placeholder="Enter your password" value={formData.password} onChange={handleChange} disabled={loading} autoComplete="current-password" required InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Lock className="!text-slate-400" /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton type="button" edge="end" disabled={loading} onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="!text-slate-400 hover:!bg-slate-50 hover:!text-slate-700">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} sx={{ "& .MuiInputLabel-root": { color: "#64748b", fontWeight: 600 }, "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" }, "& .MuiOutlinedInput-root": { minHeight: 58, borderRadius: "15px", backgroundColor: "#ffffff" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: 1.5 } }} />

                <div className="flex items-center gap-2 px-0.5 text-xs font-semibold text-slate-500"><CheckCircle sx={{ fontSize: 16 }} className="!text-emerald-500" /><span>Secure authentication with protected sessions</span></div>

                <Button type="submit" fullWidth variant="contained" disabled={loading} endIcon={loading ? <CircularProgress size={18} className="!text-white" /> : <ArrowForward />} className="!min-h-[58px] !rounded-2xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 !px-5 !text-sm !font-extrabold !normal-case !tracking-[0.01em] !text-white !shadow-[0_18px_35px_-18px_rgba(37,99,235,0.85)] transition-all duration-200 hover:!-translate-y-0.5 hover:!from-blue-700 hover:!to-indigo-700 disabled:!cursor-not-allowed disabled:!opacity-60">{loading ? "Signing in..." : "Sign in to ApnaAcademy"}</Button>
              </form>

              <div className="mt-7 border-t border-slate-100 pt-6 text-center"><Typography component="p" className="!text-sm !text-slate-500">Don't have an account? <Link to="/register" className="font-extrabold text-blue-600 transition-colors hover:text-blue-700 hover:underline">Create an account</Link></Typography></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><span className="inline-flex items-center gap-1.5"><Security sx={{ fontSize: 14 }} />Secure access</span><span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" /><span className="inline-flex items-center gap-1.5"><CheckCircle sx={{ fontSize: 14 }} />Protected session</span></div>
        </section>
      </div>
    </main>
  );
}
