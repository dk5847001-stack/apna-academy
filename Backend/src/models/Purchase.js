import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
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
      default: "",
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    purchaseType: {
      type: String,
      enum: ["course", "all-access"],
      default: "course",
      index: true,
    },

    unlockMode: {
      type: String,
      enum: ["daily", "all_access"],
      default: "daily",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ user: 1, course: 1 });
purchaseSchema.index({ paymentStatus: 1, purchasedAt: -1 });
purchaseSchema.index({ purchasedAt: -1, createdAt: -1 });

// Razorpay identifiers must never be associated with more than one purchase.
// Partial indexes are used because pending purchases intentionally have empty
// payment IDs until Razorpay returns the real identifiers.
purchaseSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayOrderId: { $type: "string", $ne: "" } },
  }
);

purchaseSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayPaymentId: { $type: "string", $ne: "" } },
  }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
