import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

import { API_BASE_URL } from "../constants/config";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      return "Please enter your full name.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
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

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      const responseData = response?.data;
      const registerData = responseData?.data;

      if (!registerData?.token || !registerData?.user) {
        throw new Error(
          "Registration succeeded, but the server returned an invalid response."
        );
      }

      localStorage.setItem("token", registerData.token);

      localStorage.setItem(
        "user",
        JSON.stringify(registerData.user)
      );

      setSuccess(
        "Account created successfully. Redirecting..."
      );

      const dashboardUrl =
        import.meta.env.VITE_DASHBOARD_URL ||
        "http://localhost:5175";

      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 700);
    } catch (requestError) {
      const status = requestError?.response?.status;
      const serverData = requestError?.response?.data;

      const serverMessage =
        serverData?.message ||
        serverData?.error?.message ||
        serverData?.errors?.message;

      if (serverMessage) {
        setError(serverMessage);
      } else if (status === 409) {
        setError(
          "An account with this email already exists."
        );
      } else if (status === 400) {
        setError(
          "Please check your details and try again."
        );
      } else if (status >= 500) {
        setError(
          "Something went wrong on the server. Please try again."
        );
      } else if (
        requestError?.code === "ERR_NETWORK" ||
        requestError?.message === "Network Error"
      ) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setError(
          requestError?.message ||
            "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_-35px_rgba(15,23,42,0.35)] lg:grid-cols-2">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden min-h-[720px] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">

            {/* BRAND */}
            <div className="mb-12 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-2xl backdrop-blur-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
                <School fontSize="small" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide">
                  ApnaAcademy
                </p>

                <p className="text-xs text-slate-400">
                  Learn. Build. Grow.
                </p>
              </div>
            </div>

            {/* HERO */}
            <div className="max-w-xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Security fontSize="inherit" />
                Start your learning journey
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                Build skills.

                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                  Build your future.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Create your ApnaAcademy account and get access
                to structured courses, practical learning and
                your personal learning dashboard.
              </p>

            </div>

            {/* BENEFITS */}
            <div className="mt-10 space-y-3">

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Security fontSize="small" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Secure account
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your authentication is securely handled.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <School fontSize="small" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Structured learning
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Learn through organized courses and modules.
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* LEARNING JOURNEY */}
          <div className="relative z-10 grid grid-cols-3 gap-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-xl font-black">
                Learn
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Courses
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-xl font-black">
                Build
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Projects
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-xl font-black">
                Grow
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Skills
              </p>
            </div>

          </div>
        </section>

        {/* REGISTER PANEL */}
        <section className="flex items-center p-6 sm:p-10 xl:p-14">
          <div className="mx-auto w-full max-w-md">

            {/* MOBILE BRAND */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                <School />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  ApnaAcademy
                </p>

                <p className="text-xs text-slate-500">
                  Learn. Build. Grow.
                </p>
              </div>

            </div>

            {/* HEADER */}
            <div className="mb-7">

              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Star fontSize="small" />
                Get started
              </div>

              <Typography
                component="h2"
                className="!text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
              >
                Create your account
              </Typography>

              <Typography
                component="p"
                className="!mt-3 !text-sm !leading-6 !text-slate-500"
              >
                Join ApnaAcademy and start building your skills
                today.
              </Typography>

            </div>

            {/* ERROR */}
            {error && (
              <Alert
                severity="error"
                className="!mb-5 !rounded-2xl !border !border-red-200 !bg-red-50"
              >
                {error}
              </Alert>
            )}

            {/* SUCCESS */}
            {success && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                className="!mb-5 !rounded-2xl !border !border-emerald-200 !bg-emerald-50"
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
                type={showPassword ? "text" : "password"}
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
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        disabled={loading}
                        edge="end"
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
                  showConfirmPassword ? "text" : "password"
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
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        disabled={loading}
                        edge="end"
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

              {/* SUBMIT */}
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
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
                className="!mt-2 !min-h-[54px] !rounded-2xl !bg-slate-950 !px-5 !text-sm !font-bold !normal-case !shadow-xl !shadow-slate-950/15 transition-all hover:!-translate-y-0.5 hover:!bg-blue-600 hover:!shadow-blue-600/20 disabled:!cursor-not-allowed disabled:!opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </Button>

            </Box>

            {/* LOGIN */}
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

            {/* SECURITY */}
            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Security fontSize="small" />
              Secure authentication powered by ApnaAcademy
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}