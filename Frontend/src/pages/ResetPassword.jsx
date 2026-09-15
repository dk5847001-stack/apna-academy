import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Alert, Button, CircularProgress, IconButton, InputAdornment, LinearProgress, TextField, Typography } from "@mui/material";
import { ArrowBack, CheckCircle, Lock, LockReset, School, Visibility, VisibilityOff } from "@mui/icons-material";

import api from "../services/api";

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "Unable to connect to the server. Please try again in a moment.";
  }
  if (status === 429) return "Too many requests. Please wait and try again.";
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  return data?.message || data?.error?.message || error?.message || "Unable to reset your password.";
};

const getStrength = (password) => {
  if (!password) return { score: 0, label: "", percent: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[score], percent: score * 20 };
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);

  const validate = () => {
    if (!token) return "This password reset link is invalid or incomplete.";
    if (!password) return "Please enter a new password.";
    if (password.length < 8) return "Password must contain at least 8 characters.";
    if (password.length > 128) return "Password must not exceed 128 characters.";
    if (!confirmPassword) return "Please confirm your new password.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || success) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-white px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-50 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-indigo-50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-[1180px] items-center justify-center">
        <section className="w-full max-w-[500px]">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-[20px] bg-blue-600/15 blur-xl" />
              <div className="relative flex h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_20px_45px_-18px_rgba(37,99,235,0.65)] ring-8 ring-white">
                <School sx={{ fontSize: 30 }} />
              </div>
            </div>
            <Typography component="p" className="!text-[21px] !font-black !tracking-[-0.025em] !text-slate-950">ApnaAcademy</Typography>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400"><span className="h-px w-5 bg-slate-200" />Learn • Build • Grow<span className="h-px w-5 bg-slate-200" /></div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/90 bg-white/95 p-1 shadow-[0_35px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="rounded-[26px] border border-slate-100 bg-white px-5 py-7 sm:px-9 sm:py-9">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-blue-700"><LockReset sx={{ fontSize: 15 }} />Password recovery</div>
                <Typography component="h1" className="!text-[32px] !font-black !leading-[1.08] !tracking-[-0.035em] !text-slate-950 sm:!text-[36px]">Create a new password</Typography>
                <Typography component="p" className="!mt-3 !text-[14px] !leading-6 !text-slate-500">Choose a strong password to secure your ApnaAcademy account.</Typography>
              </div>

              {error && <Alert severity="error" variant="outlined" onClose={() => setError("")} className="!mb-5 !rounded-2xl">{error}</Alert>}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex gap-3"><CheckCircle className="mt-0.5 !text-emerald-600" /><div><p className="text-sm font-extrabold text-emerald-900">Password updated successfully</p><p className="mt-1 text-sm leading-6 text-emerald-800">Your password has been changed. Redirecting you to Login...</p></div></div>
                </div>
              ) : !token ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"><p className="text-sm font-extrabold text-amber-900">Invalid reset link</p><p className="mt-1 text-sm leading-6 text-amber-800">This link is missing its reset token. Please request a new password reset link.</p></div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <TextField
                    fullWidth label="New password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} disabled={loading} autoComplete="new-password" autoFocus required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Lock className="!text-slate-400" /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton type="button" onClick={() => setShowPassword((value) => !value)} edge="end" disabled={loading} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                    sx={{ "& .MuiInputLabel-root": { color: "#64748b", fontWeight: 600 }, "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" }, "& .MuiOutlinedInput-root": { minHeight: 58, borderRadius: "15px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: 1.5 } }}
                  />

                  {password && <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center justify-between text-xs font-bold"><span className="text-slate-500">Password strength</span><span className="text-slate-700">{strength.label}</span></div><LinearProgress variant="determinate" value={strength.percent} className="!mt-2 !h-1.5 !rounded-full" /><p className="mt-2 text-[11px] text-slate-500">Use 8+ characters with a mix of uppercase, lowercase, numbers and symbols.</p></div>}

                  <TextField
                    fullWidth label="Confirm new password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} disabled={loading} autoComplete="new-password" required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Lock className="!text-slate-400" /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton type="button" onClick={() => setShowConfirmPassword((value) => !value)} edge="end" disabled={loading} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                    sx={{ "& .MuiInputLabel-root": { color: "#64748b", fontWeight: 600 }, "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" }, "& .MuiOutlinedInput-root": { minHeight: 58, borderRadius: "15px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: 1.5 } }}
                  />

                  <Button type="submit" fullWidth variant="contained" disabled={loading} endIcon={loading ? <CircularProgress size={18} className="!text-white" /> : <LockReset />} className="!min-h-[58px] !rounded-2xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-sm !font-extrabold !normal-case !text-white !shadow-[0_18px_35px_-18px_rgba(37,99,235,0.85)] hover:!from-blue-700 hover:!to-indigo-700 disabled:!opacity-60">{loading ? "Updating password..." : "Reset password"}</Button>
                </form>
              )}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center"><Link to="/login" className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700 hover:underline"><ArrowBack sx={{ fontSize: 17 }} />Back to Login</Link></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
