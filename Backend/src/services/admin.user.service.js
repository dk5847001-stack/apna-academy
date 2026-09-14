import mongoose from "mongoose";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";

const ALLOWED_ROLES = new Set(["user", "admin"]);
const ALLOWED_STATUSES = new Set(["active", "inactive", "suspended"]);

const sanitizeUser = (user) => ({
  id: user._id?.toString(), name: user.name, email: user.email, role: user.role, avatar: user.avatar || "", phone: user.phone || "",
  isEmailVerified: Boolean(user.isEmailVerified), status: user.status, lastLoginAt: user.lastLoginAt || null, createdAt: user.createdAt, updatedAt: user.updatedAt,
});
const assertObjectId = (id, message = "Invalid user id.") => { if (!mongoose.Types.ObjectId.isValid(id)) { const error = new Error(message); error.statusCode = 400; throw error; } };

export const listAdminUsers = async ({ page = 1, limit = 20, search = "", role = "", status = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1); const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100); const query = {};
  if (search?.trim()) { const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); query.$or = [{ name: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }, { phone: { $regex: escaped, $options: "i" } }]; }
  if (role && ALLOWED_ROLES.has(role)) query.role = role; if (status && ALLOWED_STATUSES.has(status)) query.status = status;
  const skip = (safePage - 1) * safeLimit;
  const [users, total] = await Promise.all([User.find(query).select("name email role avatar phone isEmailVerified status lastLoginAt createdAt updatedAt").sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(), User.countDocuments(query)]);
  return { users: users.map(sanitizeUser), pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
};

export const getAdminUser = async (userId) => {
  assertObjectId(userId);
  const user = await User.findById(userId).select("name email role avatar phone isEmailVerified status lastLoginAt createdAt updatedAt").lean();
  if (!user) { const error = new Error("User not found."); error.statusCode = 404; throw error; }
  return sanitizeUser(user);
};

export const getAdminUserDetails = async (userId) => {
  assertObjectId(userId); const user = await User.findById(userId).select("name email role avatar phone isEmailVerified status lastLoginAt createdAt updatedAt").lean();
  if (!user) { const error = new Error("User not found."); error.statusCode = 404; throw error; }
  const [purchases, progress, certificates] = await Promise.all([
    Purchase.find({ user: userId }).populate("course", "title slug").sort({ purchasedAt: -1 }).limit(20).lean(),
    Progress.find({ user: userId }).populate("course", "title slug thumbnail").sort({ updatedAt: -1 }).limit(20).lean(),
    Certificate.find({ user: userId }).populate("course", "title slug").sort({ issueDate: -1 }).limit(20).lean(),
  ]);
  return {
    user: sanitizeUser(user),
    summary: {
      purchases: purchases.length, paidPurchases: purchases.filter((x) => x.paymentStatus === "paid").length,
      revenue: purchases.filter((x) => x.paymentStatus === "paid").reduce((sum, x) => sum + Number(x.amount || 0), 0),
      coursesStarted: progress.length, coursesCompleted: progress.filter((x) => x.isCompleted).length,
      certificates: certificates.length, validCertificates: certificates.filter((x) => x.isValid).length,
    },
    purchases: purchases.map((x) => ({ id: x._id.toString(), amount: x.amount, currency: x.currency, status: x.paymentStatus, purchaseType: x.purchaseType, purchasedAt: x.purchasedAt, expiresAt: x.expiresAt, razorpayOrderId: x.razorpayOrderId || "", razorpayPaymentId: x.razorpayPaymentId || "", course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug } : null })),
    progress: progress.map((x) => ({ id: x._id.toString(), overallProgress: x.overallProgress || 0, isCompleted: Boolean(x.isCompleted), completedAt: x.completedAt || null, lastWatchedPosition: x.lastWatchedPosition || 0, completedVideoCount: x.completedVideos?.length || 0, updatedAt: x.updatedAt, course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug, thumbnail: x.course.thumbnail || "" } : null })),
    certificates: certificates.map((x) => ({ id: x._id.toString(), certificateId: x.certificateId, recipientName: x.recipientName, issueDate: x.issueDate, isValid: Boolean(x.isValid), certificateUrl: x.certificateUrl || "", verificationUrl: x.verificationUrl || "", course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug } : null })),
  };
};

export const updateAdminUser = async ({ userId, actorId, role, status }) => {
  assertObjectId(userId); assertObjectId(actorId); const user = await User.findById(userId); if (!user) { const error = new Error("User not found."); error.statusCode = 404; throw error; }
  if (role !== undefined && !ALLOWED_ROLES.has(role)) { const error = new Error("Invalid role."); error.statusCode = 400; throw error; }
  if (status !== undefined && !ALLOWED_STATUSES.has(status)) { const error = new Error("Invalid account status."); error.statusCode = 400; throw error; }
  const isSelf = user._id.toString() === actorId.toString();
  if (isSelf && role !== undefined && role !== "admin") { const error = new Error("You cannot remove your own admin role."); error.statusCode = 400; throw error; }
  if (isSelf && status !== undefined && status !== "active") { const error = new Error("You cannot deactivate your own admin account."); error.statusCode = 400; throw error; }
  if (user.role === "admin" && ((role === "user") || (status !== undefined && status !== "active"))) { const activeAdminCount = await User.countDocuments({ role: "admin", status: "active" }); if (activeAdminCount <= 1) { const error = new Error("At least one active admin account must remain."); error.statusCode = 400; throw error; } }
  if (role !== undefined) user.role = role; if (status !== undefined) user.status = status; await user.save(); return sanitizeUser(user.toObject());
};
