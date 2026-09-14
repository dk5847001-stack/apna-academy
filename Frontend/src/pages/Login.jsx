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
    return data?.message || "Invalid email or password.";
  }

  if (status === 403) {
    return data?.message || "Your account is not active.";
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
  const location = useLocation();

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
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

  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * =====================================================
   * CHECK EXISTING AUTHENTICATION
   * =====================================================
   * Authentication is determined by the Backend
   * HttpOnly cookie. We intentionally do NOT read
   * or store a JWT in localStorage.
   */
  useEffect(() => {
    if (authCheckStarted.current) {
      return;
    }

    authCheckStarted.current = true;

    const verifyExistingSession = async () => {
      try {
        const response = await api.get("/auth/me");
        const currentUser = response?.data?.data;

        if (!currentUser) {
          throw new Error("Invalid authentication response.");
        }

        window.location.replace(
          `${getDashboardUrl()}${getRedirectPath()}`
        );
      } catch {
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
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const loginData = response?.data?.data;
      const user = loginData?.user;

      // Backend creates the HttpOnly authentication cookie.
      // The returned JWT is intentionally not stored in localStorage.
      if (!user) {
        throw new Error(
          "Login succeeded, but the server returned an invalid user response."
        );
      }

      setSuccess("Login successful. Opening your dashboard...");

      window.setTimeout(() => {
        const redirectPath = getRedirectPath();

        window.location.replace(
          `${getDashboardUrl()}${redirectPath}`
        );
      }, 500);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
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
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <School />
          </div>

          <CircularProgress
            size={22}
            thickness={4}
            className="!text-blue-600"
          />

          <Typography
            component="p"
            className="!text-sm !font-medium !text-slate-500"
          >
            Checking your account...
          </Typography>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-white px-4 py-10 text-slate-900 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1080px] justify-center">
        <section className="w-full max-w-[470px]">
          {/* BRAND MARK */}
          <div className="mb-9 flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_30px_-12px_rgba(37,99,235,0.65)] ring-8 ring-blue-50">
              <School sx={{ fontSize: 27 }} />
            </div>

            <Typography
              component="p"
              className="!text-lg !font-extrabold !tracking-tight !text-slate-950"
            >
              ApnaAcademy
            </Typography>

            <Typography
              component="p"
              className="!mt-1 !text-xs !font-medium !tracking-wide !text-slate-400"
            >
              LEARN • BUILD • GROW
            </Typography>
          </div>

          {/* LOGIN CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.38)] sm:p-8">
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <Security sx={{ fontSize: 15 }} />
                Secure sign in
              </div>

              <Typography
                component="h1"
                className="!text-[30px] !font-black !leading-tight !tracking-[-0.02em] !text-slate-950"
              >
                Welcome back
              </Typography>

              <Typography
                component="p"
                className="!mt-2 !max-w-md !text-sm !leading-6 !text-slate-500"
              >
                Sign in to continue learning and access your ApnaAcademy dashboard.
              </Typography>
            </div>

            {/* ALERTS */}
            {error && (
              <Alert
                severity="error"
                variant="outlined"
                onClose={() => setError("")}
                className="!mb-5 !rounded-2xl !border-red-200 !bg-red-50/40"
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                variant="outlined"
                className="!mb-5 !rounded-2xl !border-emerald-200 !bg-emerald-50/40"
              >
                {success}
              </Alert>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
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
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="!text-slate-400" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                    fontWeight: 600,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2563eb",
                  },
                  "& .MuiOutlinedInput-root": {
                    minHeight: 56,
                    borderRadius: "14px",
                    backgroundColor: "#ffffff",
                    transition: "all 180ms ease",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2563eb",
                    borderWidth: 1.5,
                  },
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                required
                InputLabelProps={{ shrink: true }}
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
                          setShowPassword((value) => !value)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="!text-slate-400 hover:!bg-slate-50 hover:!text-slate-700"
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
                  "& .MuiInputLabel-root": {
                    color: "#64748b",
                    fontWeight: 600,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2563eb",
                  },
                  "& .MuiOutlinedInput-root": {
                    minHeight: 56,
                    borderRadius: "14px",
                    backgroundColor: "#ffffff",
                    transition: "all 180ms ease",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2563eb",
                    borderWidth: 1.5,
                  },
                }}
              />

              <div className="flex items-center gap-2 pt-0.5 text-xs font-medium text-slate-500">
                <CheckCircle
                  sx={{ fontSize: 16 }}
                  className="!text-emerald-500"
                />
                Secure authentication
              </div>

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
                className="!min-h-[56px] !rounded-2xl !bg-blue-600 !px-5 !text-sm !font-bold !normal-case !text-white !shadow-[0_14px_28px_-16px_rgba(37,99,235,0.8)] transition-all duration-200 hover:!-translate-y-0.5 hover:!bg-blue-700 hover:!shadow-[0_18px_32px_-16px_rgba(37,99,235,0.8)] disabled:!cursor-not-allowed disabled:!opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* REGISTER */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <Typography
                component="p"
                className="!text-sm !text-slate-500"
              >
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Create an account
                </Link>
              </Typography>
            </div>
          </div>

          {/* TRUST FOOTER */}
          <div className="mt-6 flex items-center justify-center gap-2 px-4 text-center text-[11px] font-medium leading-5 text-slate-400">
            <Security sx={{ fontSize: 15 }} />
            <span>
              Your authentication is securely handled by ApnaAcademy.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
