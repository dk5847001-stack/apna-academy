import mongoose from "mongoose";

const promoRedemptionSchema = new mongoose.Schema(
  {
    promoCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * A redemption record is created only after a successful payment.
     * Phase 2 uses this collection to enforce the per-user limit during
     * validation without trusting the frontend.
     */
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
      index: true,
    },

    codeSnapshot: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    redeemedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /*
     * Immutable payment reference used for idempotent redemption creation.
     */
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

promoRedemptionSchema.index({ promoCode: 1, user: 1, redeemedAt: -1 });
promoRedemptionSchema.index({ promoCode: 1, user: 1, course: 1, redeemedAt: -1 });
promoRedemptionSchema.index({ promoCode: 1, redeemedAt: -1 });
promoRedemptionSchema.index({ user: 1, redeemedAt: -1 });

const PromoRedemption = mongoose.model(
  "PromoRedemption",
  promoRedemptionSchema
);

export default PromoRedemption;
