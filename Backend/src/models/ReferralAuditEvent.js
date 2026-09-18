import mongoose from "mongoose";

const REFERRAL_AUDIT_ACTIONS = [
  "referral_created",
  "referral_qualified",
  "reward_created",
  "reward_available",
  "withdrawal_requested",
  "withdrawal_approved",
  "withdrawal_rejected",
  "payout_processing",
  "payout_processing_started",
  "payout_processed",
  "payout_failed",
  "payout_reversed",
  "payout_reconciled",
  "reward_reversed",
  "referral_rejected",
  "referral_cancelled",
  "payout_cancelled",
  "risk_flagged",
  "risk_cleared",
  "admin_update",
];

const referralAuditEventSchema = new mongoose.Schema(
  {
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null,
      index: true,
    },

    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralReward",
      default: null,
      index: true,
    },

    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPayout",
      default: null,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    action: {
      type: String,
      enum: REFERRAL_AUDIT_ACTIONS,
      required: true,
      index: true,
    },

    /*
     * Human-readable immutable snapshot. Never store raw payment secrets here.
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

referralAuditEventSchema.index({ referral: 1, createdAt: -1 });
referralAuditEventSchema.index({ user: 1, createdAt: -1 });
referralAuditEventSchema.index({ action: 1, createdAt: -1 });

const ReferralAuditEvent = mongoose.model(
  "ReferralAuditEvent",
  referralAuditEventSchema
);

export default ReferralAuditEvent;
