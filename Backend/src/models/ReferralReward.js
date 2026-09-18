import mongoose from "mongoose";

const REFERRAL_REWARD_STATUSES = [
  "pending",
  "available",
  "withdrawal_locked",
  "paid",
  "reversed",
  "cancelled",
];

const referralRewardSchema = new mongoose.Schema(
  {
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
      unique: true,
      index: true,
    },

    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * All financial amounts are stored as integer paise.
     * ₹199 = 19900 paise.
     */
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Reward amount must be a safe integer number of paise.",
      },
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    status: {
      type: String,
      enum: REFERRAL_REWARD_STATUSES,
      default: "pending",
      index: true,
    },

    qualificationPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      index: true,
    },

    /*
     * Immutable snapshot of the qualifying transaction amount.
     */
    qualifyingPurchaseAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },

    availableAt: {
      type: Date,
      default: null,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
      index: true,
    },

    reversedAt: {
      type: Date,
      default: null,
      index: true,
    },

    reversalReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    cancellationReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

referralRewardSchema.index({ referrer: 1, status: 1, createdAt: -1 });

/*
 * A qualifying purchase can produce at most one referral reward.
 * This remains true even if payment webhooks/verification are retried.
 */
referralRewardSchema.index(
  { qualificationPurchase: 1 },
  { unique: true }
);

const ReferralReward = mongoose.model(
  "ReferralReward",
  referralRewardSchema
);

export default ReferralReward;
