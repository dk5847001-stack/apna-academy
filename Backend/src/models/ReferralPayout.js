import mongoose from "mongoose";

const REFERRAL_PAYOUT_STATUSES = [
  "requested",
  "under_review",
  "approved",
  "processing",
  "processed",
  "failed",
  "reversed",
  "rejected",
  "cancelled",
];

const PAYOUT_METHODS = ["upi", "bank"];

const referralPayoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * The exact wallet amount locked for this payout.
     */
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Payout amount must be a safe integer number of paise.",
      },
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    status: {
      type: String,
      enum: REFERRAL_PAYOUT_STATUSES,
      default: "requested",
      index: true,
    },

    payoutMethod: {
      type: String,
      enum: PAYOUT_METHODS,
      required: true,
      index: true,
    },

    /*
     * Provider-side destination identifiers will be stored in later phases.
     * Raw bank/UPI secrets should not be duplicated in payout documents.
     */
    providerFundAccountId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
    },

    destinationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    reversedAt: {
      type: Date,
      default: null,
    },

    reversalReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    /*
     * Provider payout identifiers are unique when present.
     */
    providerPayoutId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },

    idempotencyKey: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      unique: true,
      sparse: true,
      index: true,
    },

    adminActor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

referralPayoutSchema.index({ user: 1, status: 1, createdAt: -1 });
referralPayoutSchema.index({ status: 1, requestedAt: -1 });
referralPayoutSchema.index(
  { providerPayoutId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerPayoutId: { $type: "string", $ne: "" },
    },
  }
);

const ReferralPayout = mongoose.model(
  "ReferralPayout",
  referralPayoutSchema
);

export default ReferralPayout;
