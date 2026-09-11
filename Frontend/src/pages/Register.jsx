import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Box,
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
  Person,
  School,
  Security,
  Star,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import api from "../services/api";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ||
  "http://localhost:5175";

const getDashboardUrl = () => {
  return DASHBOARD_URL.replace(/\/+$/, "");
};

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (
    error?.code === "ERR_NETWORK" ||
    error?.message === "Network Error"
  ) {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (status === 409) {
    return (
      data?.message ||
      "An account with this email already exists."
    );
  }

  if (status === 400) {
    return (
      data?.message ||
      data?.error?.message ||
      "Please check your details and try again."
    );
  }

  if (status === 401) {
    return (
      data?.message ||
      "Unable to authenticate this request."
    );
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }

  return (
    data?.message ||
    data?.error?.message ||
    error?.message ||
    "Unable to create your account. Please try again."
  );
};

export default function Register() {
  const authCheckStarted = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check whether the user is already logged in.
  useEffect(() => {
    if (authCheckStarted.current) {
      return;
    }

    authCheckStarted.current = true;

    const verifyExistingSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        const currentUser = response?.data?.data;

        if (!currentUser) {
          throw new Error(
            "Invalid authentication response."
          );
        }

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        window.location.replace(getDashboardUrl());
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setCheckingAuth(false);
      }
    };

    verifyExistingSession();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      return "Please enter your full name.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (name.length > 100) {
      return "Name must not exceed 100 characters.";
    }

    if (!email) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (password.length > 128) {
      return "Password must not exceed 128 characters.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm();

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
      });

      const registerData = response?.data?.data;

      const token = registerData?.token;
      const user = registerData?.user;

      if (!token || !user) {
        throw new Error(
          "Registration succeeded, but the server returned an invalid authentication response."
        );
      }

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setSuccess(
        "Account created successfully. Opening your dashboard..."
      );

      window.setTimeout(() => {
        window.location.replace(getDashboardUrl());
      }, 700);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <School />
          </div>

          <CircularProgress
            size={24}
            thickness={4}
            className="!text-blue-600"
          />

          <Typography
            component="p"
            className="!text-sm !font-semibold !text-slate-500"
          >
            Checking your account...
          </Typography>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.3)] lg:grid-cols-2">

        {/* LEFT BRAND SECTION */}
        <section className="relative hidden min-h-[700px] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative z-10">
            {/* BRAND */}
            <div className="mb-12 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <School fontSize="small" />
              </div>

              <div>
                <Typography
                  component="p"
                  className="!text-sm !font-bold !tracking-wide !text-white"
                >
                  ApnaAcademy
                </Typography>

                <Typography
                  component="p"
                  className="!text-xs !text-slate-400"
                >
                  Learn. Build. Grow.
                </Typography>
              </div>
            </div>

            {/* BADGE */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
              <Security fontSize="inherit" />
              Start your learning journey
            </div>

            {/* HEADING */}
            <Typography
              component="h1"
              className="!text-4xl !font-black !leading-tight !tracking-tight !text-white xl:!text-5xl"
            >
              Build skills.
              <span className="block text-blue-400">
                Build your future.
              </span>
            </Typography>

            <Typography
              component="p"
              className="!mt-6 !max-w-lg !text-base !leading-7 !text-slate-400"
            >
              Create your ApnaAcademy account
              and get access to structured
              courses, practical learning and
              your personal learning dashboard.
            </Typography>

            {/* BENEFITS */}
            <div className="mt-10 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <Security fontSize="small" />
                </div>

                <div>
                  <Typography
                    component="p"
                    className="!text-sm !font-bold !text-white"
                  >
                    Secure account
                  </Typography>

                  <Typography
                    component="p"
                    className="!mt-1 !text-xs !text-slate-400"
                  >
                    Secure authentication for
                    your learning account.
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <CheckCircle fontSize="small" />
                </div>

                <div>
                  <Typography
                    component="p"
                    className="!text-sm !font-bold !text-white"
                  >
                    Structured learning
                  </Typography>

                  <Typography
                    component="p"
                    className="!mt-1 !text-xs !text-slate-400"
                  >
                    Learn through organized
                    courses and modules.
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                  <Star fontSize="small" />
                </div>

                <div>
                  <Typography
                    component="p"
                    className="!text-sm !font-bold !text-white"
                  >
                    Track your growth
                  </Typography>

                  <Typography
                    component="p"
                    className="!mt-1 !text-xs !text-slate-400"
                  >
                    Build skills and progress
                    toward your goals.
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* JOURNEY */}
          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Typography
                component="p"
                className="!text-xl !font-black !text-white"
              >
                Learn
              </Typography>

              <Typography
                component="p"
                className="!mt-1 !text-xs !text-slate-400"
              >
                Courses
              </Typography>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Typography
                component="p"
                className="!text-xl !font-black !text-white"
              >
                Build
              </Typography>

              <Typography
                component="p"
                className="!mt-1 !text-xs !text-slate-400"
              >
                Projects
              </Typography>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Typography
                component="p"
                className="!text-xl !font-black !text-white"
              >
                Grow
              </Typography>

              <Typography
                component="p"
                className="!mt-1 !text-xs !text-slate-400"
              >
                Skills
              </Typography>
            </div>
          </div>
        </section>

        {/* REGISTER FORM */}
        <section className="flex items-center p-6 sm:p-10 xl:p-14">
          <div className="mx-auto w-full max-w-md">

            {/* MOBILE BRAND */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                <School />
              </div>

              <div>
                <Typography
                  component="p"
                  className="!font-bold !text-slate-950"
                >
                  ApnaAcademy
                </Typography>

                <Typography
                  component="p"
                  className="!text-xs !text-slate-500"
                >
                  Learn. Build. Grow.
                </Typography>
              </div>
            </div>

            {/* HEADER */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Security fontSize="small" />

                <span>
                  Secure registration
                </span>
              </div>

              <Typography
                component="h2"
                className="!text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
              >
                Create your account
              </Typography>

              <Typography
                component="p"
                className="!mt-2 !text-sm !leading-6 !text-slate-500"
              >
                Join ApnaAcademy and start
                building your skills today.
              </Typography>
            </div>

            {/* ERROR */}
            {error && (
              <Alert
                severity="error"
                variant="outlined"
                onClose={() => setError("")}
                className="!mb-5 !rounded-2xl"
              >
                {error}
              </Alert>
            )}

            {/* SUCCESS */}
            {success && (
              <Alert
                severity="success"
                variant="outlined"
                icon={<CheckCircle />}
                className="!mb-5 !rounded-2xl"
              >
                {success}
              </Alert>
            )}

            {/* FORM */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* NAME */}
              <TextField
                fullWidth
                id="name"
                name="name"
                type="text"
                label="Full name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
                autoFocus
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person className="!text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1rem",
                    backgroundColor: "#f8fafc",
                  },
                }}
              />

              {/* EMAIL */}
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="!text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1rem",
                    backgroundColor: "#f8fafc",
                  },
                }}
              />

              {/* PASSWORD */}
              <TextField
                fullWidth
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="!text-slate-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        edge="end"
                        disabled={loading}
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1rem",
                    backgroundColor: "#f8fafc",
                  },
                }}
              />

              {/* CONFIRM PASSWORD */}
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                label="Confirm password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="!text-slate-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        edge="end"
                        disabled={loading}
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1rem",
                    backgroundColor: "#f8fafc",
                  },
                }}
              />

              {/* SECURITY INFO */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <Security
                  sx={{
                    fontSize: 17,
                  }}
                  className="!text-blue-600"
                />

                <Typography
                  component="p"
                  className="!text-xs !font-medium !text-slate-500"
                >
                  Your account information is
                  securely handled.
                </Typography>
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress
                      size={18}
                      className="!text-white"
                    />
                  ) : (
                    <ArrowForward />
                  )
                }
                className="!min-h-[54px] !rounded-2xl !bg-blue-600 !px-5 !text-sm !font-bold !normal-case !text-white !shadow-lg !shadow-blue-600/20 transition-all hover:!-translate-y-0.5 hover:!bg-blue-700 hover:!shadow-blue-600/30 disabled:!cursor-not-allowed disabled:!opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </Box>

            {/* LOGIN LINK */}
            <div className="mt-8 text-center">
              <Typography
                component="p"
                className="!text-sm !text-slate-500"
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </Typography>
            </div>

            {/* TRUST */}
            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Security fontSize="small" />

              <span>
                Secure authentication powered by
                ApnaAcademy
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}