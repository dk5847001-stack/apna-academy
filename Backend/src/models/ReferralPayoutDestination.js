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
    providerFundAccountId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
      select: false,
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
