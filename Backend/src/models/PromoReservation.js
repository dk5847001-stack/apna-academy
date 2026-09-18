import mongoose from "mongoose";

const promoReservationSchema = new mongoose.Schema(
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

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /*
     * A slot makes per-user reservations race-safe.
     * For perUserLimit=1, slot 0 is unique for the user/promo.
     */
    slot: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["reserved", "consumed", "released", "expired"],
      default: "reserved",
      index: true,
    },

    reservedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    releasedAt: {
      type: Date,
      default: null,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Only one active reservation may occupy a promo/user/slot.
 * This closes the per-user race between concurrent checkout attempts.
 */
promoReservationSchema.index(
  { promoCode: 1, user: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "reserved" },
  }
);

promoReservationSchema.index({ status: 1, expiresAt: 1 });
promoReservationSchema.index({ promoCode: 1, status: 1, expiresAt: 1 });

const PromoReservation = mongoose.model(
  "PromoReservation",
  promoReservationSchema
);

export default PromoReservation;
