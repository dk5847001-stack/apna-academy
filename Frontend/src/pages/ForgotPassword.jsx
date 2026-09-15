import { useState } from "react";
import { Link } from "react-router-dom";

import { Alert, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { ArrowBack, Email, LockReset, School } from "@mui/icons-material";

import api from "../services/api";

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "Unable to connect to the server. Please try again in a moment.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }

  return data?.message || data?.error?.message || error?.message || "Unable to send the reset link.";
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email: normalizedEmail });
      setSuccess(true);
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
            <div className="mt-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              <span className="h-px w-5 bg-slate-200" />
              Learn • Build • Grow
              <span className="h-px w-5 bg-slate-200" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/90 bg-white/95 p-1 shadow-[0_35px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent" />
            <div className="rounded-[26px] border border-slate-100 bg-white px-5 py-7 sm:px-9 sm:py-9">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-blue-700">
                  <LockReset sx={{ fontSize: 15 }} />
                  Account recovery
                </div>
                <Typography component="h1" className="!text-[32px] !font-black !leading-[1.08] !tracking-[-0.035em] !text-slate-950 sm:!text-[36px]">Forgot your password?</Typography>
                <Typography component="p" className="!mt-3 !text-[14px] !leading-6 !text-slate-500">Enter the email associated with your ApnaAcademy account and we’ll send a secure password reset link.</Typography>
              </div>

              {error && <Alert severity="error" variant="outlined" onClose={() => setError("")} className="!mb-5 !rounded-2xl">{error}</Alert>}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">✓</div>
                    <div>
                      <p className="text-sm font-extrabold text-emerald-900">Check your email</p>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">If an account exists for that email, a password reset link has been sent. The link expires in about 15 minutes.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <TextField
                    fullWidth
                    label="Email address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Email className="!text-slate-400" /></InputAdornment>,
                    }}
                    sx={{
                      "& .MuiInputLabel-root": { color: "#64748b", fontWeight: 600 },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                      "& .MuiOutlinedInput-root": { minHeight: 58, borderRadius: "15px", backgroundColor: "#fff" },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: 1.5 },
                    }}
                  />

                  <Button type="submit" fullWidth variant="contained" disabled={loading} endIcon={loading ? <CircularProgress size={18} className="!text-white" /> : <LockReset />} className="!min-h-[58px] !rounded-2xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-sm !font-extrabold !normal-case !text-white !shadow-[0_18px_35px_-18px_rgba(37,99,235,0.85)] hover:!from-blue-700 hover:!to-indigo-700 disabled:!opacity-60">
                    {loading ? "Sending reset link..." : "Send reset link"}
                  </Button>
                </form>
              )}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 transition-colors hover:text-blue-700 hover:underline">
                  <ArrowBack sx={{ fontSize: 17 }} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
