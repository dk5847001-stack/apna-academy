import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User.js";
import { generateAccessToken } from "../utils/token.js";
import { sendEmailVerificationOtp, sendPasswordResetEmail } from "./email.service.js";
import { createConcurrentLoginNotification, recordConcurrentLoginEvent } from "./security.service.js";
import {
  createReferralAttribution,
  generateUniqueReferralCode,
  normalizeReferralCode,
  validateReferralCodeForRegistration,
} from "./referral.service.js";

const OTP_EXPIRES_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_RESENDS_PER_HOUR = 5;
const OTP_RESEND_WINDOW_MS = 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRES_MS = 15 * 60 * 1000;

const createSessionId = () => crypto.randomUUID();

/*
 * Atomically replaces the user's active session. The previous session id is
 * returned so callers can distinguish a first login from a session takeover.
 */
const MAX_CONCURRENT_LOGIN_HISTORY = 20;
const SESSION_UPDATE_RETRIES = 5;
const CONCURRENT_LOGIN_DETECTION_LIMIT = 5;

const establishSession = async (user, { ipAddress = null, userAgent = null, source = "login" } = {}) => {
  for (let attempt = 0; attempt < SESSION_UPDATE_RETRIES; attempt += 1) {
    const sessionId = createSessionId();
    const issuedAt = new Date();

    const currentUser = await User.findById(user._id).select(
      "+activeSessionId +activeSessionIssuedAt +concurrentLoginDetectionCount"
    );

    if (!currentUser) {
      throw buildVerificationError("User account was not found.", 404);
    }

    const previousSessionId = currentUser.activeSessionId || null;
    const previousSessionIssuedAt = currentUser.activeSessionIssuedAt || null;
    const hadPreviousSession = Boolean(previousSessionId);

    const filter = hadPreviousSession
      ? { _id: user._id, activeSessionId: previousSessionId }
      : {
          _id: user._id,
          $or: [
            { activeSessionId: null },
            { activeSessionId: { $exists: false } },
          ],
        };

    const update = {
      $set: {
        activeSessionId: sessionId,
        activeSessionIssuedAt: issuedAt,
        lastLoginAt: issuedAt,
      },
    };

    let detectionNumber = null;

    if (hadPreviousSession) {
      detectionNumber =
        (currentUser.concurrentLoginDetectionCount || 0) + 1;

      update.$inc = { concurrentLoginDetectionCount: 1 };
      update.$set.lastConcurrentLoginDetectedAt = issuedAt;

      if (detectionNumber >= CONCURRENT_LOGIN_DETECTION_LIMIT) {
        update.$set.status = "suspended";
        update.$set.securityFrozenAt = issuedAt;
        update.$set.securityFreezeReason =
          "Automatic security freeze after repeated concurrent login detections.";
        update.$set.activeSessionId = null;
        update.$set.activeSessionIssuedAt = null;
      }
      update.$push = {
        concurrentLoginDetectionHistory: {
          $each: [
            {
              detectedAt: issuedAt,
              previousSessionIssuedAt,
              newSessionIssuedAt: issuedAt,
              detectionNumber,
            },
          ],
          $slice: -MAX_CONCURRENT_LOGIN_HISTORY,
        },
      };
    }

    const updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true,
      projection: {
        activeSessionId: 1,
        concurrentLoginDetectionCount: 1,
      },
    });

    if (!updatedUser) {
      continue;
    }

    const detectionCount =
      updatedUser.concurrentLoginDetectionCount || 0;

    if (hadPreviousSession) {
      await recordConcurrentLoginEvent({
        userId: user._id,
        detectionNumber: detectionCount,
        previousSessionIssuedAt,
        newSessionIssuedAt: issuedAt,
        ipAddress,
        userAgent,
        source,
        correlationId: sessionId,
      }).catch((error) => {
        console.error("Concurrent login audit event failed:", error);
      });

      await createConcurrentLoginNotification({
        userId: user._id,
        detectionNumber: detectionCount,
      });

      if (detectionNumber >= CONCURRENT_LOGIN_DETECTION_LIMIT) {
        const error = new Error(
          "Your account has been automatically frozen after reaching the concurrent login security limit. Please contact support for account review."
        );
        error.statusCode = 403;
        error.code = "ACCOUNT_SECURITY_FROZEN";
        error.security = {
          detectionCount,
          detectionLimit: CONCURRENT_LOGIN_DETECTION_LIMIT,
          accountFrozen: true,
        };
        throw error;
      }
    }

    return {
      sessionId,
      token: generateAccessToken(user, sessionId),
      replacedExistingSession: hadPreviousSession,
      concurrentLoginDetected: hadPreviousSession,
      concurrentLoginDetectionCount: detectionCount,
    };
  }

  const error = new Error(
    "Unable to establish a secure login session. Please try signing in again."
  );
  error.statusCode = 503;
  error.code = "SESSION_ESTABLISHMENT_FAILED";
  throw error;
};
export const invalidateSession = async ({ userId, sessionId }) => {
  if (!userId || !sessionId) {
    return false;
  }

  const result = await User.updateOne(
    { _id: userId, activeSessionId: sessionId },
    {
      $set: {
        activeSessionId: null,
        activeSessionIssuedAt: null,
      },
    }
  );

  return result.modifiedCount === 1;
};

const createOtp = () =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const hashPasswordResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createVerificationPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
});

const buildVerificationError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const issueEmailVerificationOtp = async (user, { enforceCooldown = true } = {}) => {
  const now = Date.now();

  if (
    enforceCooldown &&
    user.emailVerificationLastSentAt &&
    now - user.emailVerificationLastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
  ) {
    const remainingSeconds = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (now - user.emailVerificationLastSentAt.getTime())) / 1000
    );
    const error = buildVerificationError(
      `Please wait ${remainingSeconds} seconds before requesting another code.`,
      429
    );
    error.retryAfter = remainingSeconds;
    throw error;
  }

  let resendCount = user.emailVerificationResendCount || 0;
  let windowStartedAt = user.emailVerificationResendWindowStartedAt;

  if (!windowStartedAt || now - windowStartedAt.getTime() >= OTP_RESEND_WINDOW_MS) {
    resendCount = 0;
    windowStartedAt = new Date(now);
  }

  if (resendCount >= OTP_MAX_RESENDS_PER_HOUR) {
    throw buildVerificationError(
      "Too many verification emails were requested. Please try again later.",
      429
    );
  }

  const otp = createOtp();
  user.emailVerificationOtpHash = hashOtp(otp);
  user.emailVerificationOtpExpiresAt = new Date(now + OTP_EXPIRES_MS);
  user.emailVerificationOtpAttempts = 0;
  user.emailVerificationLastSentAt = new Date(now);
  user.emailVerificationResendCount = resendCount + 1;
  user.emailVerificationResendWindowStartedAt = windowStartedAt;

  await user.save();

  try {
    await sendEmailVerificationOtp({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes: 10,
    });
  } catch (error) {
    user.emailVerificationOtpHash = null;
    user.emailVerificationOtpExpiresAt = null;
    user.emailVerificationOtpAttempts = 0;
    await user.save().catch(() => {});
    throw error;
  }

  return {
    email: user.email,
    expiresInSeconds: OTP_EXPIRES_MS / 1000,
    resendAvailableInSeconds: OTP_RESEND_COOLDOWN_MS / 1000,
  };
};

export const registerUser = async ({
  name,
  email,
  password,
  referralCode = "",
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const submittedReferralCode = normalizeReferralCode(referralCode);

  let user = await User.findOne({ email: normalizedEmail }).select(
    "+password +emailVerificationOtpHash +emailVerificationOtpExpiresAt +emailVerificationOtpAttempts +emailVerificationLastSentAt +emailVerificationResendCount +emailVerificationResendWindowStartedAt +pendingReferralCode"
  );

  const existingUnverifiedUser = Boolean(user);

  if (user?.isEmailVerified) {
    throw buildVerificationError(
      "An account with this email already exists.",
      409
    );
  }

  /*
   * Referral attribution is captured before account activation. For an
   * unverified retry, the first pending code wins so the referrer cannot
   * be switched by submitting another code later.
   */
  const pendingReferralCode =
    normalizeReferralCode(user?.pendingReferralCode) || submittedReferralCode;

  if (pendingReferralCode) {
    await validateReferralCodeForRegistration({
      referralCode: pendingReferralCode,
      referredUserId: user?._id || null,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  if (!user) {
    user = new User({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      status: "inactive",
      isEmailVerified: false,
      referralCode: await generateUniqueReferralCode(),
      pendingReferralCode: pendingReferralCode || null,
    });
  } else {
    user.name = trimmedName;
    user.password = hashedPassword;
    user.status = "inactive";

    if (!user.referralCode) {
      user.referralCode = await generateUniqueReferralCode();
    }

    if (pendingReferralCode && !user.pendingReferralCode) {
      user.pendingReferralCode = pendingReferralCode;
    }
  }

  await user.save();

  if (pendingReferralCode) {
    await createReferralAttribution({
      referredUserId: user._id,
      referralCode: pendingReferralCode,
    });

    user.pendingReferralCode = null;
    await user.save();
  }

  const verification = await issueEmailVerificationOtp(user, {
    enforceCooldown: existingUnverifiedUser,
  });

  return {
    requiresEmailVerification: true,
    user: createVerificationPayload(user),
    verification,
  };
};

export const resendEmailVerificationOtp = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt +emailVerificationOtpAttempts +emailVerificationLastSentAt +emailVerificationResendCount +emailVerificationResendWindowStartedAt"
  );

  if (!user) {
    throw buildVerificationError("No registration was found for this email.", 404);
  }

  if (user.isEmailVerified) {
    throw buildVerificationError("This email is already verified.", 409);
  }

  return issueEmailVerificationOtp(user);
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = String(otp || "").trim();

  if (!/^\d{6}$/.test(normalizedOtp)) {
    throw buildVerificationError("Please enter the 6-digit verification code.");
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt +emailVerificationOtpAttempts"
  );

  if (!user) {
    throw buildVerificationError("No registration was found for this email.", 404);
  }

  if (user.isEmailVerified) {
    throw buildVerificationError("This email is already verified.", 409);
  }

  if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
    throw buildVerificationError("Your verification code is unavailable. Please request a new code.");
  }

  if (user.emailVerificationOtpExpiresAt.getTime() <= Date.now()) {
    user.emailVerificationOtpHash = null;
    user.emailVerificationOtpExpiresAt = null;
    user.emailVerificationOtpAttempts = 0;
    await user.save();
    throw buildVerificationError("Your verification code has expired. Please request a new code.");
  }

  if ((user.emailVerificationOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
    throw buildVerificationError(
      "Too many incorrect attempts. Please request a new verification code.",
      429
    );
  }

  const expectedHash = Buffer.from(user.emailVerificationOtpHash, "hex");
  const receivedHash = Buffer.from(hashOtp(normalizedOtp), "hex");

  const matches =
    expectedHash.length === receivedHash.length &&
    crypto.timingSafeEqual(expectedHash, receivedHash);

  if (!matches) {
    user.emailVerificationOtpAttempts = (user.emailVerificationOtpAttempts || 0) + 1;
    await user.save();

    const attemptsLeft = Math.max(
      0,
      OTP_MAX_ATTEMPTS - user.emailVerificationOtpAttempts
    );

    throw buildVerificationError(
      attemptsLeft
        ? `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
        : "Invalid verification code. Please request a new code.",
      attemptsLeft ? 400 : 429
    );
  }

  user.isEmailVerified = true;
  user.status = "active";
  user.emailVerificationOtpHash = null;
  user.emailVerificationOtpExpiresAt = null;
  user.emailVerificationOtpAttempts = 0;
  user.emailVerificationLastSentAt = null;
  user.emailVerificationResendCount = 0;
  user.emailVerificationResendWindowStartedAt = null;
  await user.save();

  const session = await establishSession(user, { source: "email-verification" });

  return {
    token: session.token,
    user: createVerificationPayload(user),
  };
};

export const loginUser = async ({ email, password, ipAddress, userAgent }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +concurrentLoginDetectionCount"
  );

  if (!user) {
    throw buildVerificationError("Invalid email or password.", 401);
  }

  if (!user.isEmailVerified) {
    throw buildVerificationError(
      "Please verify your email before signing in.",
      403
    );
  }

  if (user.status !== "active") {
    if (user.status === "suspended") {
      const error = buildVerificationError(
        "Your account has been automatically frozen after reaching the concurrent login security limit. Please contact support for account review.",
        403
      );
      error.code = "ACCOUNT_SECURITY_FROZEN";
      error.security = {
        detectionCount: user.concurrentLoginDetectionCount || 0,
        detectionLimit: CONCURRENT_LOGIN_DETECTION_LIMIT,
        accountFrozen: true,
      };
      throw error;
    }
    throw buildVerificationError("Your account is not active.", 403);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw buildVerificationError("Invalid email or password.", 401);
  }

  const session = await establishSession(user, {
    ipAddress,
    userAgent,
    source: "login",
  });

  return {
    token: session.token,
    user: createVerificationPayload(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw buildVerificationError("User not found.", 404);
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

export const createPasswordResetToken = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordResetToken +passwordResetExpiresAt"
  );

  if (!user) {
    return { token: null, user: null };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: rawToken,
      expiresInMinutes: PASSWORD_RESET_EXPIRES_MS / 60_000,
    });
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save().catch(() => {});

    const passwordResetEmailError = new Error(
      "Password reset email could not be sent."
    );
    passwordResetEmailError.statusCode = 503;
    passwordResetEmailError.code = "PASSWORD_RESET_EMAIL_FAILED";
    passwordResetEmailError.cause = error;
    throw passwordResetEmailError;
  }

  return {
    token: null,
    user: { id: user._id, name: user.name, email: user.email },
    expiresAt,
  };
};

export const resetPassword = async ({ token, password }) => {
  if (!token || typeof token !== "string") {
    throw buildVerificationError("Invalid or missing password reset token.");
  }

  const hashedToken = hashPasswordResetToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpiresAt");

  if (!user) {
    throw buildVerificationError("This password reset link is invalid or has expired.");
  }

  user.password = await bcrypt.hash(password, 12);
  user.activeSessionId = null;
  user.activeSessionIssuedAt = null;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  return {
    success: true,
    message: "Password reset successfully. You can now sign in with your new password.",
  };
};
