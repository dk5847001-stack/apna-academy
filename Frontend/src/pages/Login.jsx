import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  Security,
  School,
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

  if (status === 401) {
    return (
      data?.message ||
      "Invalid email or password."
    );
  }

  if (status === 403) {
    return (
      data?.message ||
      "Your account is not active."
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
    "Unable to login. Please try again."
  );
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPath = () => {
    const params = new URLSearchParams(
      location.search
    );

    const redirect = params.get("redirect");

    // Allow only internal application paths.
    // Never redirect to an external website.
    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
    ) {
      return redirect;
    }

    return "/dashboard";
  };

  const authCheckStarted = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * =====================================================
   * CHECK EXISTING AUTHENTICATION
   * =====================================================
   *
   * Do not trust localStorage token blindly.
   * Verify the token with backend /auth/me.
   */
  useEffect(() => {
    if (authCheckStarted.current) {
      return;
    }

    authCheckStarted.current = true;

    const verifyExistingSession = async () => {
  try {
    /*
     * Authentication is determined by the Backend
     * HttpOnly cookie.
     *
     * We intentionally do NOT read any JWT from
     * localStorage.
     */

    const response = await api.get("/auth/me");

    const currentUser =
      response?.data?.data;

    if (!currentUser) {
      throw new Error(
        "Invalid authentication response."
      );
    }

    /*
     * The browser session is already authenticated.
     * Open the Dashboard application.
     */
    window.location.replace(
      `${getDashboardUrl()}${getRedirectPath()}`
    );
  } catch {
    /*
     * No valid backend session.
     *
     * Do not attempt to manipulate the HttpOnly
     * authentication cookie from JavaScript.
     *
     * Simply show the login form.
     */
    setCheckingAuth(false);
  }
};

verifyExistingSession();
  }, []);

/*
 * =====================================================
 * INPUT CHANGE
 * =====================================================
 */
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

/*
 * =====================================================
 * FORM VALIDATION
 * =====================================================
 */
const validateForm = () => {
  const email =
    formData.email.trim().toLowerCase();

  const password = formData.password;

  if (!email) {
    return "Please enter your email address.";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Please enter your password.";
  }

  return "";
};

/*
 * =====================================================
 * LOGIN
 * =====================================================
 */
const handleSubmit = async (event) => {
  event.preventDefault();

  if (loading) {
    return;
  }

  setError("");
  setSuccess("");

  const validationError =
    validateForm();

  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);

  try {
    const response = await api.post(
      "/auth/login",
      {
        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,
      }
    );

    const loginData =
      response?.data?.data;

    /*
     * Backend contract:
     *
     * {
     *   success: true,
     *   message: "...",
     *   data: {
     *     token: "...",
     *     user: {...}
     *   }
     * }
     */
    const user = loginData?.user;

/*
 * The backend creates the HttpOnly authentication
 * cookie during /auth/login.
 *
 * The JWT returned by the backend is NOT stored
 * in localStorage and is NOT used by the frontend
 * as the authentication mechanism.
 */
if (!user) {
  throw new Error(
    "Login succeeded, but the server returned an invalid user response."
  );
}

    setSuccess(
      "Login successful. Opening your dashboard..."
    );

    /*
     * Give the success message a moment to render,
     * then move to the separate Dashboard application.
     */
    window.setTimeout(() => {
      const redirectPath = getRedirectPath();

      window.location.replace(
        `${getDashboardUrl()}${redirectPath}`
      );
    }, 500);
  } catch (requestError) {
    setError(
      getErrorMessage(requestError)
    );
  } finally {
    setLoading(false);
  }
};

/*
 * =====================================================
 * LOADING / EXISTING SESSION CHECK
 * =====================================================
 */
if (checkingAuth) {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center justify-center gap-4">
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

      {/* =================================================
            LEFT BRAND SECTION
        ================================================== */}
      <section className="relative hidden min-h-[680px] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

        {/* Subtle decorative elements */}
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
            Secure learning platform
          </div>

          {/* HEADING */}
          <Typography
            component="h1"
            className="!text-4xl !font-black !leading-tight !tracking-tight !text-white xl:!text-5xl"
          >
            Continue your
            <span className="block text-blue-400">
              learning journey.
            </span>
          </Typography>

          {/* DESCRIPTION */}
          <Typography
            component="p"
            className="!mt-6 !max-w-lg !text-base !leading-7 !text-slate-400"
          >
            Sign in to access your courses,
            track your progress, continue
            learning and unlock your
            achievements.
          </Typography>

          {/* FEATURES */}
          <div className="mt-10 grid gap-3">

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <School fontSize="small" />
              </div>

              <div>
                <Typography
                  component="p"
                  className="!text-sm !font-bold !text-white"
                >
                  Structured Learning
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <CheckCircle fontSize="small" />
              </div>

              <div>
                <Typography
                  component="p"
                  className="!text-sm !font-bold !text-white"
                >
                  Track Your Progress
                </Typography>

                <Typography
                  component="p"
                  className="!mt-1 !text-xs !text-slate-400"
                >
                  Continue exactly where
                  you stopped learning.
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
                  Earn Achievements
                </Typography>

                <Typography
                  component="p"
                  className="!mt-1 !text-xs !text-slate-400"
                >
                  Complete your learning
                  journey and earn certificates.
                </Typography>
              </div>
            </div>

          </div>
        </div>

        {/* STEPS */}
        <div className="relative z-10 grid grid-cols-3 gap-3">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Typography
              component="p"
              className="!text-xl !font-black !text-white"
            >
              01
            </Typography>

            <Typography
              component="p"
              className="!mt-1 !text-xs !text-slate-400"
            >
              Learn
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Typography
              component="p"
              className="!text-xl !font-black !text-white"
            >
              02
            </Typography>

            <Typography
              component="p"
              className="!mt-1 !text-xs !text-slate-400"
            >
              Practice
            </Typography>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Typography
              component="p"
              className="!text-xl !font-black !text-white"
            >
              03
            </Typography>

            <Typography
              component="p"
              className="!mt-1 !text-xs !text-slate-400"
            >
              Achieve
            </Typography>
          </div>

        </div>
      </section>

      {/* =================================================
            LOGIN SECTION
        ================================================== */}
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
                Secure sign in
              </span>
            </div>

            <Typography
              component="h2"
              className="!text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
            >
              Welcome back.
            </Typography>

            <Typography
              component="p"
              className="!mt-2 !text-sm !leading-6 !text-slate-500"
            >
              Sign in to continue your
              learning journey with
              ApnaAcademy.
            </Typography>
          </div>

          {/* ALERTS */}
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

          {success && (
            <Alert
              severity="success"
              variant="outlined"
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
            className="space-y-5"
          >

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
              autoFocus
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
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
                          (value) =>
                            !value
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

            {/* EXTRA OPTIONS */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle
                  sx={{
                    fontSize: 16,
                  }}
                  className="!text-emerald-500"
                />

                <span>
                  Secure authentication
                </span>
              </div>

              {/* Password reset intentionally skipped for now */}
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
                ? "Signing in..."
                : "Sign in"}
            </Button>

          </Box>

          {/* REGISTER */}
          <div className="mt-8 text-center">
            <Typography
              component="p"
              className="!text-sm !text-slate-500"
            >
              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Create an account
              </Link>
            </Typography>
          </div>

          {/* TRUST */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Security
                sx={{
                  fontSize: 16,
                }}
              />

              <span>
                Your authentication is securely
                handled by ApnaAcademy.
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  </main>
);
}