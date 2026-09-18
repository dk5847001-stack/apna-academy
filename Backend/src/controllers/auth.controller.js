import {
  registerUser,
  loginUser,
  getCurrentUser,
  resendEmailVerificationOtp,
  verifyEmailOtp,
  createPasswordResetToken,
  resetPassword,
  invalidateSession,
} from "../services/auth.service.js";

import {
  validateRegisterInput,
  validateLoginInput,
} from "../validators/auth.validator.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const AUTH_COOKIE_NAME = "apnaacademy_token";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const setAuthenticationCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const errors = validateRegisterInput({ name, email, password });

  if (Object.keys(errors).length > 0) {
    const error = new Error("Please correct the validation errors.");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const result = await registerUser({ name, email, password });

  return successResponse({
    res,
    statusCode: 201,
    message: "Verification code sent to your email.",
    data: result,
  });
});

export const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    const error = new Error("Please enter a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  const result = await resendEmailVerificationOtp(email);

  return successResponse({
    res,
    message: "A new verification code has been sent.",
    data: result,
  });
});

export const verifyRegistrationEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    const error = new Error("Please enter a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (!/^\d{6}$/.test(String(otp || "").trim())) {
    const error = new Error("Please enter the 6-digit verification code.");
    error.statusCode = 400;
    throw error;
  }

  const result = await verifyEmailOtp({ email, otp });
  setAuthenticationCookie(res, result.token);

  return successResponse({
    res,
    message: "Email verified successfully. Welcome to ApnaAcademy.",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errors = validateLoginInput({ email, password });

  if (Object.keys(errors).length > 0) {
    const error = new Error("Please correct the validation errors.");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const result = await loginUser({ email, password });
  setAuthenticationCookie(res, result.token);

  return successResponse({
    res,
    message: "Login successful.",
    data: result,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const error = new Error("Please enter a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  try {
    await createPasswordResetToken(normalizedEmail);
  } catch (error) {
    if (error?.code !== "PASSWORD_RESET_EMAIL_FAILED") {
      throw error;
    }
  }

  return successResponse({
    res,
    message: "If an account exists for that email, a password reset link has been sent.",
    data: { email: normalizedEmail },
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || typeof token !== "string") {
    const error = new Error("Invalid or missing password reset token.");
    error.statusCode = 400;
    throw error;
  }

  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    const error = new Error("Password must contain between 8 and 128 characters.");
    error.statusCode = 400;
    throw error;
  }

  const result = await resetPassword({ token, password });

  return successResponse({
    res,
    message: result.message,
    data: result,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.userId);

  return successResponse({
    res,
    message: "Current user fetched successfully.",
    data: user,
  });
});

export const logout = async (req, res) => {
  await invalidateSession({
    userId: req.user.userId,
    sessionId: req.user.sessionId,
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
