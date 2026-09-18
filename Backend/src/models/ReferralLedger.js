import mongoose from "mongoose";

const REFERRAL_LEDGER_TYPES = [
  "reward_pending",
  "reward_available",
  "withdrawal_lock",
  "withdrawal_unlock",
  "payout",
  "payout_reversal",
  "reward_reversal",
  "manual_adjustment",
];

const referralLedgerSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralWallet",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    type: {
      type: String,
      enum: REFERRAL_LEDGER_TYPES,
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Ledger amount must be a safe integer number of paise.",
      },
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    balanceAfter: {
      totalEarnedPaise: { type: Number, required: true, min: 0 },
      availableBalancePaise: { type: Number, required: true, min: 0 },
      pendingBalancePaise: { type: Number, required: true, min: 0 },
      lockedBalancePaise: { type: Number, required: true, min: 0 },
      paidOutPaise: { type: Number, required: true, min: 0 },
      reversedPaise: { type: Number, required: true, min: 0 },
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

referralLedgerSchema.index({ user: 1, createdAt: -1 });
referralLedgerSchema.index({ wallet: 1, createdAt: -1 });
referralLedgerSchema.index({ reward: 1, type: 1 });

const ReferralLedger = mongoose.model("ReferralLedger", referralLedgerSchema);

export default ReferralLedger;
