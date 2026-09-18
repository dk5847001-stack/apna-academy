import mongoose from "mongoose";

const REFERRAL_RISK_EVENT_TYPES = [
  "self_referral",
  "duplicate_account_pattern",
  "duplicate_payout_destination",
  "rapid_referral_activity",
  "suspicious_payment_pattern",
  "withdrawal_velocity",
  "manual_review",
  "other",
];

const REFERRAL_RISK_STATUSES = ["open", "reviewed", "dismissed", "confirmed"];

const referralRiskEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null,
      index: true,
    },

    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPayout",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: REFERRAL_RISK_EVENT_TYPES,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: REFERRAL_RISK_STATUSES,
      default: "open",
      index: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    /*
     * Store only non-sensitive, structured signals.
     * Raw passwords, tokens, full bank details, and payment secrets are forbidden.
     */
    signals: {
      type: [String],
      default: [],
      validate: {
        validator(values) {
          return values.every(
            (value) => typeof value === "string" && value.length <= 200
          );
        },
        message: "Risk signals must be short strings.",
      },
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    correlationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

referralRiskEventSchema.index({ user: 1, createdAt: -1 });
referralRiskEventSchema.index({ status: 1, createdAt: -1 });
referralRiskEventSchema.index({ type: 1, createdAt: -1 });

const ReferralRiskEvent = mongoose.model(
  "ReferralRiskEvent",
  referralRiskEventSchema
);

export default ReferralRiskEvent;
