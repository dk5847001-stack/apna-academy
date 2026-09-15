import mongoose from "mongoose";

const dsaPaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: null, unique: true, sparse: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR", uppercase: true },
    plan: { type: String, enum: ["DSA_PREMIUM_MONTHLY"], default: "DSA_PREMIUM_MONTHLY" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending", index: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

dsaPaymentSchema.index({ userId: 1, status: 1, createdAt: -1 });

const DsaPayment = mongoose.model("DsaPayment", dsaPaymentSchema);
export default DsaPayment;
