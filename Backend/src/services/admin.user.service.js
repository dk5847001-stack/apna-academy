import mongoose from "mongoose";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import SecurityEvent from "../models/SecurityEvent.js";

const ALLOWED_ROLES = new Set(["user", "admin"]);
const ALLOWED_STATUSES = new Set(["active", "inactive", "suspended"]);

const sanitizeUser = (user) => ({
  id: user._id?.toString(), name: user.name, email: user.email, role: user.role, avatar: user.avatar || "", phone: user.phone || "",
  isEmailVerified: Boolean(user.isEmailVerified), status: user.status, lastLoginAt: user.lastLoginAt || null, concurrentLoginDetectionCount: user.concurrentLoginDetectionCount || 0, securityFrozenAt: user.securityFrozenAt || null, securityFreezeReason: user.securityFreezeReason || null, createdAt: user.createdAt, updatedAt: user.updatedAt,
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
  const user = await User.findById(userId).select("name email role avatar phone isEmailVerified status lastLoginAt concurrentLoginDetectionCount securityFrozenAt securityFreezeReason createdAt updatedAt").lean();
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
  const activity = [
    user.createdAt && { id: `user-created-${user._id}`, type: "account", title: "Account created", description: "User account was created on the platform.", at: user.createdAt },
    user.lastLoginAt && { id: `login-${user._id}-${new Date(user.lastLoginAt).getTime()}`, type: "login", title: "Last login", description: "User most recently signed in.", at: user.lastLoginAt },
    ...purchases.map((x) => ({ id: `purchase-${x._id}`, type: "purchase", title: x.paymentStatus === "paid" ? "Purchase completed" : "Purchase activity", description: `${x.course?.title || "Course"} · ${x.paymentStatus || "unknown"} · ${x.amount ?? 0} ${x.currency || "INR"}`, at: x.purchasedAt || x.createdAt })),
    ...progress.map((x) => ({ id: `progress-${x._id}`, type: x.isCompleted ? "completion" : "progress", title: x.isCompleted ? "Course completed" : "Learning progress updated", description: `${x.course?.title || "Course"} · ${Number(x.overallProgress || 0)}% progress`, at: x.updatedAt || x.createdAt })),
    ...certificates.map((x) => ({ id: `certificate-${x._id}`, type: "certificate", title: x.isValid ? "Certificate issued" : "Certificate status updated", description: `${x.course?.title || "Course"} · ${x.certificateId || "No certificate ID"}`, at: x.issueDate || x.createdAt })),
  ].filter((x) => x?.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 50);
  return {
    user: sanitizeUser(user),
    summary: {
      purchases: purchases.length, paidPurchases: purchases.filter((x) => x.paymentStatus === "paid").length,
      revenue: purchases.filter((x) => x.paymentStatus === "paid").reduce((sum, x) => sum + Number(x.amount || 0), 0),
      coursesStarted: progress.length, coursesCompleted: progress.filter((x) => x.isCompleted).length,
      certificates: certificates.length, validCertificates: certificates.filter((x) => x.isValid).length,
      activityCount: activity.length,
    },
    activity,
    purchases: purchases.map((x) => ({ id: x._id.toString(), amount: x.amount, currency: x.currency, status: x.paymentStatus, purchaseType: x.purchaseType, purchasedAt: x.purchasedAt, expiresAt: x.expiresAt, razorpayOrderId: x.razorpayOrderId || "", razorpayPaymentId: x.razorpayPaymentId || "", course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug } : null })),
    progress: progress.map((x) => ({ id: x._id.toString(), overallProgress: x.overallProgress || 0, isCompleted: Boolean(x.isCompleted), completedAt: x.completedAt || null, lastWatchedPosition: x.lastWatchedPosition || 0, completedVideoCount: x.completedVideos?.length || 0, updatedAt: x.updatedAt, course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug, thumbnail: x.course.thumbnail || "" } : null })),
    certificates: certificates.map((x) => ({ id: x._id.toString(), certificateId: x.certificateId, recipientName: x.recipientName, issueDate: x.issueDate, isValid: Boolean(x.isValid), certificateUrl: x.certificateUrl || "", verificationUrl: x.verificationUrl || "", course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug } : null })),
  };
};

export const getAdminSecurityDetails = async (userId) => {
  assertObjectId(userId);

  const user = await User.findById(userId)
    .select("name email role status concurrentLoginDetectionCount lastConcurrentLoginDetectedAt securityFrozenAt securityFreezeReason")
    .lean();

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const events = await SecurityEvent.find({ user: userId })
    .sort({ detectedAt: -1 })
    .limit(50)
    .select("type detectionNumber detectedAt previousSessionIssuedAt newSessionIssuedAt source correlationId")
    .lean();

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    security: {
      detectionCount: user.concurrentLoginDetectionCount || 0,
      detectionLimit: 5,
      remainingDetections: Math.max(0, 5 - (user.concurrentLoginDetectionCount || 0)),
      lastDetectedAt: user.lastConcurrentLoginDetectedAt || null,
      frozenAt: user.securityFrozenAt || null,
      freezeReason: user.securityFreezeReason || null,
      events,
    },
  };
};

export const unfreezeUserSecurity = async ({ userId, actorId }) => {
  assertObjectId(userId);
  assertObjectId(actorId);

  if (userId.toString() === actorId.toString()) {
    const error = new Error("You cannot change your own account security state.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("+activeSessionId");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.status !== "suspended" || !user.securityFrozenAt) {
    const error = new Error("This account is not security-frozen.");
    error.statusCode = 400;
    throw error;
  }

  user.status = "active";
  user.securityFrozenAt = null;
  user.securityFreezeReason = null;
  user.activeSessionId = null;
  user.activeSessionIssuedAt = null;
  await user.save();

  return sanitizeUser(user.toObject());
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
