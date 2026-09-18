import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtpHash: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
      index: true,
    },

    emailVerificationOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    emailVerificationLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    emailVerificationResendCount: {
      type: Number,
      default: 0,
      select: false,
    },

    emailVerificationResendWindowStartedAt: {
      type: Date,
      default: null,
      select: false,
    },

    blockedAt: {
      type: Date,
      default: null,
      select: false,
    },

    blockReason: {
      type: String,
      default: null,
      select: false,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    /*
     * Single active-session control.
     *
     * Only the session represented by activeSessionId is allowed
     * to use authenticated API endpoints.
     */
    activeSessionId: {
      type: String,
      default: null,
      select: false,
      index: true,
    },

    activeSessionIssuedAt: {
      type: Date,
      default: null,
      select: false,
    },

    concurrentLoginDetectionCount: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
      index: true,
    },

    lastConcurrentLoginDetectedAt: {
      type: Date,
      default: null,
      select: false,
    },

    securityFrozenAt: {
      type: Date,
      default: null,
      select: false,
    },

    securityFreezeReason: {
      type: String,
      default: null,
      select: false,
      maxlength: 500,
    },

    concurrentLoginDetectionHistory: {
      type: [
        {
          detectedAt: { type: Date, required: true },
          previousSessionIssuedAt: { type: Date, default: null },
          newSessionIssuedAt: { type: Date, required: true },
          detectionNumber: { type: Number, required: true, min: 1 },
        },
      ],
      default: [],
      select: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
      index: true,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ role: 1, status: 1 });

const User = mongoose.model("User", userSchema);

export default User;
