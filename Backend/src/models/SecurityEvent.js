import mongoose from "mongoose";

const securityEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["concurrent-login"],
      required: true,
      index: true,
    },
    detectionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    detectedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    previousSessionIssuedAt: {
      type: Date,
      default: null,
    },
    newSessionIssuedAt: {
      type: Date,
      required: true,
    },
    ipHash: {
      type: String,
      default: null,
      select: false,
    },
    userAgentHash: {
      type: String,
      default: null,
      select: false,
    },
    source: {
      type: String,
      enum: ["login", "email-verification"],
      required: true,
    },
    correlationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

securityEventSchema.index({ user: 1, detectedAt: -1 });
securityEventSchema.index({ user: 1, type: 1, detectedAt: -1 });

const SecurityEvent = mongoose.model("SecurityEvent", securityEventSchema);

export default SecurityEvent;
