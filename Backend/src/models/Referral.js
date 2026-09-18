import mongoose from "mongoose";

const REFERRAL_STATUSES = [
  "registered",
  "qualified",
  "rewarded",
  "rejected",
  "cancelled",
];

const referralSchema = new mongoose.Schema(
  {
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
      unique: true,
    },

    referralCodeSnapshot: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 32,
    },

    status: {
      type: String,
      enum: REFERRAL_STATUSES,
      default: "registered",
      index: true,
    },

    attributionSource: {
      type: String,
      enum: ["registration_link", "manual_admin", "system"],
      default: "registration_link",
      index: true,
    },

    attributedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    qualifiedAt: {
      type: Date,
      default: null,
      index: true,
    },

    qualificationPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
      index: true,
    },

    qualificationPurchaseAmountPaise: {
      type: Number,
      default: null,
      min: 0,
    },

    rewardedAt: {
      type: Date,
      default: null,
      index: true,
    },

    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralReward",
      default: null,
      index: true,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

referralSchema.index({ referrer: 1, status: 1, createdAt: -1 });
referralSchema.index({ status: 1, createdAt: -1 });
referralSchema.index(
  { qualificationPurchase: 1 },
  { unique: true, partialFilterExpression: { qualificationPurchase: { $type: "objectId" } } }
);

referralSchema.pre("validate", function validateRelationship() {
  if (
    this.referrer &&
    this.referredUser &&
    this.referrer.toString() === this.referredUser.toString()
  ) {
    this.invalidate("referredUser", "A user cannot refer their own account.");
  }

  if (
    this.status === "qualified" &&
    (!this.qualifiedAt || !this.qualificationPurchase)
  ) {
    this.invalidate(
      "qualifiedAt",
      "A qualified referral requires qualification timestamp and purchase."
    );
  }

  if (
    this.status === "rewarded" &&
    (!this.reward || !this.rewardedAt)
  ) {
    this.invalidate(
      "reward",
      "A rewarded referral requires a reward record and reward timestamp."
    );
  }
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
