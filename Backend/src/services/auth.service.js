import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import { generateAccessToken } from "../utils/token.js";

export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists."
    );

    error.statusCode = 409;

    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateAccessToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

export const loginUser = async ({
  email,
  password,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error(
      "Invalid email or password."
    );

    error.statusCode = 401;

    throw error;
  }

  if (user.status !== "active") {
    const error = new Error(
      "Your account is not active."
    );

    error.statusCode = 403;

    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    const error = new Error(
      "Invalid email or password."
    );

    error.statusCode = 401;

    throw error;
  }

  user.lastLoginAt = new Date();

  await user.save();

  const token = generateAccessToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select(
    "-password"
  );

  if (!user) {
    const error = new Error("User not found.");

    error.statusCode = 404;

    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
};

/**
 * Generate a secure password reset token.
 *
 * The raw token is returned to the caller so it can be
 * sent through email.
 *
 * Only the SHA-256 hash of the token is stored in MongoDB.
 */
export const createPasswordResetToken = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select(
    "+passwordResetToken +passwordResetExpiresAt"
  );

  /*
   * Always return the same response for existing and
   * non-existing accounts at controller level to avoid
   * revealing whether an email is registered.
   */
  if (!user) {
    return {
      token: null,
      user: null,
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiresAt = expiresAt;

  await user.save();

  return {
    token: rawToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    expiresAt,
  };
};

/**
 * Reset the user's password using the raw token received
 * from the password-reset link.
 */
export const resetPassword = async ({
  token,
  password,
}) => {
  if (!token || typeof token !== "string") {
    const error = new Error(
      "Invalid or missing password reset token."
    );

    error.statusCode = 400;

    throw error;
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: {
      $gt: new Date(),
    },
  }).select(
    "+password +passwordResetToken +passwordResetExpiresAt"
  );

  if (!user) {
    const error = new Error(
      "This password reset link is invalid or has expired."
    );

    error.statusCode = 400;

    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  user.password = hashedPassword;

  /*
   * Immediately invalidate the reset token so it cannot
   * be reused after a successful password change.
   */
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;

  await user.save();

  return {
    success: true,
    message:
      "Password reset successfully. You can now sign in with your new password.",
  };
};