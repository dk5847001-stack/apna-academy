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
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Email,
  Lock,
  Person,
  School,
  Security,
  Shield,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import api from "../services/api";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5175";

const getDashboardUrl = () => DASHBOARD_URL.replace(/\/+$/, "");

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (status === 409) {
    return data?.message || "An account with this email already exists.";
  }

  if (status === 429) {
    return data?.message || "Too many requests. Please wait a moment and try again.";
  }

  if (status === 503) {
    return data?.message || "Email verification is temporarily unavailable. Please try again later.";
  }

  if (status === 400) {
    return data?.message || data?.error?.message || "Please check your details and try again.";
  }

  if (status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }

  return (
    data?.message ||
    data?.error?.message ||
    error?.message ||
    "Unable to complete registration. Please try again."
  );
};

const validateRegistration = (formData) => {
  const name = formData.name.trim();
  const email = formData.email.trim().toLowerCase();
  const password = formData.password;
  const confirmPassword = formData.confirmPassword;

  if (!name) return "Please enter your full name.";
  if (name.length < 2) return "Name must contain at least 2 characters.";
  if (name.length > 100) return "Name must not exceed 100 characters.";
  if (!email) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }
  if (!password) return "Please create a password.";
  if (password.length < 8) return "Password must contain at least 8 characters.";
  if (password.length > 128) return "Password must not exceed 128 characters.";
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";

  return "";
};

export default function Register() {
  const location = useLocation();
  const authCheckStarted = useRef(false);
  const [step, setStep] = useState("details");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otp, setOtp] = useState("");

  const getReferralCode = () => {
    try {
      const value = new URLSearchParams(location.search).get("ref");
      return String(value || "").trim().toUpperCase().slice(0, 32);
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const fromUrl = getReferralCode();
    if (fromUrl) {
      sessionStorage.setItem("apnaacademy_referral_code", fromUrl);
      setReferralCode(fromUrl);
      return;
    }

    const stored = sessionStorage.getItem("apnaacademy_referral_code");
    if (stored) setReferralCode(stored);
  }, [location.search]);

  useEffect(() => {
    if (authCheckStarted.current) return;
    authCheckStarted.current = true;

    const verifyExistingSession = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response?.data?.data) {
          window.location.replace(getDashboardUrl());
          return;
        }
      } catch {
        // No active HttpOnly session. Continue registration.
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyExistingSession();
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const clearMessages = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    const validationError = validateRegistration(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        ...(referralCode ? { referralCode } : {}),
      });

      const result = response?.data?.data;
      if (!result?.requiresEmailVerification) {
        throw new Error("The server did not start email verification.");
      }

      setStep("otp");
      setOtp("");
      setResendCountdown(
        Number(result?.verification?.resendAvailableInSeconds) || 60
      );
      setSuccess(`Verification code sent to ${formData.email.trim().toLowerCase()}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    const normalizedOtp = otp.replace(/\D/g, "");
    setOtp(normalizedOtp);

    if (normalizedOtp.length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register/verify-otp", {
        email: formData.email.trim().toLowerCase(),
        otp: normalizedOtp,
      });

      const user = response?.data?.data?.user;
      if (!user) {
        throw new Error("Email was verified, but the server returned an invalid user response.");
      }

      sessionStorage.removeItem("apnaacademy_referral_code");
      setSuccess("Email verified successfully. Opening your dashboard...");
      window.setTimeout(() => {
        window.location.replace(getDashboardUrl());
      }, 500);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCountdown > 0) return;

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await api.post("/auth/register/resend-otp", {
        email: formData.email.trim().toLowerCase(),
      });

      const result = response?.data?.data;
      setResendCountdown(
        Number(result?.resendAvailableInSeconds) || 60
      );
      setSuccess("A new verification code has been sent to your email.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setResending(false);
    }
  };

  const handleBackToDetails = () => {
    setStep("details");
    setOtp("");
    setError("");
    setSuccess("");
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <School />
          </div>
          <CircularProgress size={24} thickness={4} className="!text-blue-600" />
          <Typography component="p" className="!text-sm !font-semibold !text-slate-500">
            Checking your account...
          </Typography>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-white px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <School fontSize="small" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-950">ApnaAcademy</div>
              <div className="text-[11px] font-medium text-slate-500">Learn. Build. Grow.</div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
            <Shield sx={{ fontSize: 15 }} className="!text-emerald-600" />
            Secure account setup
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden overflow-hidden bg-slate-50 p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />

            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                <Security fontSize="inherit" />
                Built for learners
              </div>

              <h1 className="max-w-md text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950 xl:text-5xl">
                Your learning journey starts here.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                Create one secure account for courses, progress tracking, assessments and verified achievements.
              </p>

              <div className="mt-9 space-y-3">
                {[
                  [Security, "Secure authentication", "Your verification code is delivered privately to your email."],
                  [CheckCircle, "Structured learning", "Access your learning journey from one connected account."],
                  [Shield, "Verified identity", "Email verification helps keep learner accounts genuine."],
                ].map(([Icon, title, description]) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon sx={{ fontSize: 19 }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-10 grid grid-cols-3 gap-3">
              {["Learn", "Practice", "Grow"].map((item, index) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-lg font-black text-slate-900">0{index + 1}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{item}</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="p-6 sm:p-10 xl:p-14">
            <div className="mx-auto w-full max-w-lg">
              <div className="mb-8 flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${step === "details" ? "bg-blue-600" : "bg-emerald-500"}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step === "otp" ? "bg-blue-600" : "bg-slate-100"}`} />
              </div>

              {step === "details" ? (
                <>
                  <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                      <Person fontSize="small" />
                      Create account
                    </div>
                    <Typography component="h2" className="!text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl">
                      Start with your details
                    </Typography>
                    <Typography component="p" className="!mt-2 !text-sm !leading-6 !text-slate-500">
                      We will send a one-time verification code to your email before activating the account.
                    </Typography>
                  </div>

                  {error && (
                    <Alert severity="error" variant="outlined" onClose={() => setError("")} className="!mb-5 !rounded-2xl">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" variant="outlined" icon={<CheckCircle />} className="!mb-5 !rounded-2xl">
                      {success}
                    </Alert>
                  )}

                  <form onSubmit={handleRegister} className="space-y-5">
                    <TextField
                      fullWidth
                      label="Full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person className="!text-slate-400" />
                          </InputAdornment>
                        ),
                      }}
                    /><br/><br/>

                    <TextField
                      fullWidth
                      label="Email address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email className="!text-slate-400" />
                          </InputAdornment>
                        ),
                      }}
                    /><br/><br/>

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock className="!text-slate-400" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              onClick={() => setShowPassword((value) => !value)}
                              edge="end"
                              disabled={loading}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    /><br/><br/>

                    <TextField
                      fullWidth
                      label="Confirm password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock className="!text-slate-400" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                              onClick={() => setShowConfirmPassword((value) => !value)}
                              edge="end"
                              disabled={loading}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    /><br/><br/>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      endIcon={!loading && <ArrowForward />}
                      className="!mt-2 !min-h-12 !rounded-xl !bg-blue-600 !text-sm !font-bold !normal-case !shadow-lg !shadow-blue-600/20 hover:!bg-blue-700"
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : "Continue to verification"}
                    </Button>
                  </form>

                  <div className="mt-7 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-blue-600 no-underline hover:text-blue-700">
                      Sign in
                    </Link>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                    <Shield sx={{ fontSize: 15 }} className="!text-emerald-500" />
                    Your password is never included in the verification email.
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={handleBackToDetails}
                      disabled={loading || resending}
                      className="mb-5 inline-flex items-center gap-1 rounded-lg text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
                    >
                      <ArrowBack sx={{ fontSize: 17 }} />
                      Back
                    </button>

                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                      <Email fontSize="small" />
                      Verify your email
                    </div>
                    <Typography component="h2" className="!text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl">
                      Enter your 6-digit code
                    </Typography>
                    <Typography component="p" className="!mt-2 !text-sm !leading-6 !text-slate-500">
                      We sent a verification code to <span className="font-bold text-slate-700">{formData.email.trim().toLowerCase()}</span>.
                    </Typography>
                  </div>

                  {error && (
                    <Alert severity="error" variant="outlined" onClose={() => setError("")} className="!mb-5 !rounded-2xl">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" variant="outlined" icon={<CheckCircle />} className="!mb-5 !rounded-2xl">
                      {success}
                    </Alert>
                  )}

                  <form onSubmit={handleVerifyOtp}>
                    <TextField
                      fullWidth
                      autoFocus
                      label="Verification code"
                      value={otp}
                      onChange={(event) => {
                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                        clearMessages();
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 6,
                        autoComplete: "one-time-code",
                      }}
                      placeholder="000000"
                      sx={{
                        "& input": {
                          letterSpacing: "0.42em",
                          fontWeight: 800,
                          textAlign: "center",
                          fontSize: "1.25rem",
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading || otp.length !== 6}
                      endIcon={!loading && <CheckCircle />}
                      className="!mt-5 !min-h-12 !rounded-xl !bg-blue-600 !text-sm !font-bold !normal-case !shadow-lg !shadow-blue-600/20 hover:!bg-blue-700"
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : "Verify & create account"}
                    </Button>
                  </form>

                  <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs leading-5 text-slate-500">
                      Didn&apos;t receive the code? Check your spam/promotions folder or request a new code.
                    </p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || resendCountdown > 0}
                      className="mt-2 text-sm font-extrabold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {resending
                        ? "Sending new code..."
                        : resendCountdown > 0
                          ? `Resend available in ${resendCountdown}s`
                          : "Resend verification code"}
                    </button>
                  </div>

                  <div className="mt-7 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                    <Shield sx={{ fontSize: 15 }} className="!text-emerald-500" />
                    Verification codes expire after 10 minutes.
                  </div>
                </>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
