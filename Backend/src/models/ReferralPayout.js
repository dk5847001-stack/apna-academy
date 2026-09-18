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

    // Stable application-level identifiers. These are safe to expose to
    // the client and are never used as provider secrets.
    withdrawalId: {
      type: String,
      required: false,
      trim: true,
      maxlength: 64,
    },

    payoutTransactionId: {
      type: String,
      required: false,
      trim: true,
      maxlength: 64,
    },

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

    providerFundAccountId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
    },

    destinationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
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

    processingAt: {
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

    reconciledAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    failureCode: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
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

    providerPayoutId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
    },

    providerStatus: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },

    providerReferenceId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },

    providerUtr: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },

    providerFailureReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    providerFailureCode: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },

    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      unique: true,
    },

    correlationId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      unique: true,
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

referralPayoutSchema.index(
  { withdrawalId: 1 },
  { unique: true, partialFilterExpression: { withdrawalId: { $type: "string" } } }
);
referralPayoutSchema.index(
  { payoutTransactionId: 1 },
  { unique: true, partialFilterExpression: { payoutTransactionId: { $type: "string" } } }
);

referralPayoutSchema.index({ user: 1, status: 1, createdAt: -1 });
referralPayoutSchema.index({ status: 1, requestedAt: -1 });
referralPayoutSchema.index(
  { providerPayoutId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerPayoutId: { $type: "string" },
    },
  }
);
referralPayoutSchema.index(
  { providerReferenceId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerReferenceId: { $type: "string" },
    },
  }
);

const ReferralPayout = mongoose.model("ReferralPayout", referralPayoutSchema);

export default ReferralPayout;
