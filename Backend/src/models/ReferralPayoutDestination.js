import mongoose from "mongoose";

const referralPayoutDestinationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["upi", "bank"],
      required: true,
      index: true,
    },
    upiId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
      select: false,
    },
    encryptedUpiId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
      select: false,
    },
    accountHolderName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },
    accountNumberLast4: {
      type: String,
      default: null,
      trim: true,
      maxlength: 4,
    },
    ifsc: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      maxlength: 11,
    },
    destinationFingerprint: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128,
      select: false,
    },
    providerContactId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
    },
    encryptedProviderContactId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
      select: false,
    },
    providerFundAccountId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
    },
    encryptedProviderFundAccountId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
      select: false,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "failed"],
      default: "unverified",
      index: true,
    },
    verificationId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
    },
    verificationReferenceId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 40,
      select: false,
    },
    verificationRegisteredName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },
    verificationNameMatchScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    verificationFailureReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ReferralPayoutDestination = mongoose.model(
  "ReferralPayoutDestination",
  referralPayoutDestinationSchema
);

export default ReferralPayoutDestination;
