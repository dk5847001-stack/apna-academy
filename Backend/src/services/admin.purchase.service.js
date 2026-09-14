import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";

const STATUSES = new Set(["pending", "paid", "failed", "refunded"]);

const sanitizePurchase = (purchase) => ({
  id: purchase._id?.toString(),
  amount: purchase.amount,
  currency: purchase.currency,
  purchaseType: purchase.purchaseType,
  unlockMode: purchase.unlockMode,
  paymentStatus: purchase.paymentStatus,
  purchasedAt: purchase.purchasedAt,
  expiresAt: purchase.expiresAt,
  razorpayOrderId: purchase.razorpayOrderId || "",
  razorpayPaymentId: purchase.razorpayPaymentId || "",
  user: purchase.user
    ? {
        id: purchase.user._id?.toString?.() || purchase.user.toString?.(),
        name: purchase.user.name || "",
        email: purchase.user.email || "",
      }
    : null,
  course: purchase.course
    ? {
        id: purchase.course._id?.toString?.() || purchase.course.toString?.(),
        title: purchase.course.title || "",
        slug: purchase.course.slug || "",
      }
    : null,
  createdAt: purchase.createdAt,
  updatedAt: purchase.updatedAt,
});

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid purchase id.");
    error.statusCode = 400;
    throw error;
  }
};

export const listAdminPurchases = async ({ page = 1, limit = 20, search = "", status = "", purchaseType = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (status && STATUSES.has(status)) query.paymentStatus = status;
  if (purchaseType && ["course", "all-access"].includes(purchaseType)) query.purchaseType = purchaseType;

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const [users, courses] = await Promise.all([
      mongoose.model("User").find({ $or: [{ name: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }] }).select("_id").lean(),
      mongoose.model("Course").find({ $or: [{ title: { $regex: escaped, $options: "i" } }, { slug: { $regex: escaped, $options: "i" } }] }).select("_id").lean(),
    ]);
    query.$or = [
      { user: { $in: users.map((item) => item._id) } },
      { course: { $in: courses.map((item) => item._id) } },
      { razorpayOrderId: { $regex: escaped, $options: "i" } },
      { razorpayPaymentId: { $regex: escaped, $options: "i" } },
    ];
  }

  const skip = (safePage - 1) * safeLimit;
  const [purchases, total] = await Promise.all([
    Purchase.find(query)
      .populate("user", "name email")
      .populate("course", "title slug")
      .sort({ purchasedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Purchase.countDocuments(query),
  ]);

  return {
    purchases: purchases.map(sanitizePurchase),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
};

export const getAdminPurchase = async (purchaseId) => {
  assertId(purchaseId);
  const purchase = await Purchase.findById(purchaseId)
    .populate("user", "name email phone")
    .populate("course", "title slug price allAccessPrice")
    .lean();
  if (!purchase) {
    const error = new Error("Purchase not found.");
    error.statusCode = 404;
    throw error;
  }
  return sanitizePurchase(purchase);
};
