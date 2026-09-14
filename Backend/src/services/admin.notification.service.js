import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const TYPES = new Set([
  "course",
  "course-update",
  "certificate",
  "module-unlocked",
  "purchase",
  "announcement",
  "promotion",
  "system",
]);

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const escapeRegex = (value) => value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const makeError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const formatNotification = (item) => ({
  id: item._id?.toString(), title: item.title, message: item.message, type: item.type,
  link: item.link || "", isRead: Boolean(item.isRead), createdAt: item.createdAt, updatedAt: item.updatedAt,
  user: item.user ? { id: item.user._id?.toString(), name: item.user.name || "", email: item.user.email || "", avatar: item.user.avatar || "" } : null,
});

const assertObjectId = (value, message = "Invalid id.") => {
  if (!isObjectId(value)) throw makeError(message);
};

const normalizePayload = ({ title, message, type = "system", link = "" }) => {
  const cleanTitle = String(title ?? "").trim();
  const cleanMessage = String(message ?? "").trim();
  const cleanType = String(type || "system").trim();
  const cleanLink = String(link ?? "").trim();
  if (!cleanTitle) throw makeError("Notification title is required.");
  if (!cleanMessage) throw makeError("Notification message is required.");
  if (cleanTitle.length > 200) throw makeError("Notification title cannot exceed 200 characters.");
  if (cleanMessage.length > 1000) throw makeError("Notification message cannot exceed 1000 characters.");
  if (cleanLink.length > 2000) throw makeError("Notification link cannot exceed 2000 characters.");
  if (!TYPES.has(cleanType)) throw makeError("Invalid notification type.");
  return { title: cleanTitle, message: cleanMessage, type: cleanType, link: cleanLink };
};

export const listAdminNotifications = async ({ page = 1, limit = 20, search = "", type = "", audience = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};
  if (type && TYPES.has(type)) query.type = type;
  if (audience === "broadcast") query.user = null;
  if (audience === "individual") query.user = { $ne: null };
  if (search?.trim()) {
    const escaped = escapeRegex(search);
    const userIds = await User.find({ $or: [{ name: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }] }).distinct("_id");
    query.$or = [{ title: { $regex: escaped, $options: "i" } }, { message: { $regex: escaped, $options: "i" } }, { user: { $in: userIds } }];
  }
  const skip = (safePage - 1) * safeLimit;
  const [rows, total] = await Promise.all([
    Notification.find(query).populate({ path: "user", select: "name email avatar" }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Notification.countDocuments(query),
  ]);
  return { notifications: rows.map(formatNotification), pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.max(Math.ceil(total / safeLimit), 1) } };
};

export const createAdminNotification = async ({ userId = null, title, message, type = "system", link = "" } = {}) => {
  const payload = normalizePayload({ title, message, type, link });
  const cleanUserId = userId ? String(userId).trim() : "";
  let recipient = null;
  if (cleanUserId) {
    assertObjectId(cleanUserId, "Invalid user id.");
    recipient = await User.findById(cleanUserId).select("name email avatar status role").lean();
    if (!recipient) throw makeError("Recipient user not found.", 404);
    if (recipient.role === "admin") throw makeError("Notifications can only be sent to student users.");
  }
  const notification = await Notification.create({ user: cleanUserId || null, ...payload, isRead: false });
  return { ...formatNotification({ ...notification.toObject(), user: recipient }), audience: cleanUserId ? "individual" : "broadcast" };
};

export const updateAdminNotification = async ({ notificationId, userId, title, message, type, link } = {}) => {
  assertObjectId(notificationId, "Invalid notification id.");
  const existing = await Notification.findById(notificationId).lean();
  if (!existing) throw makeError("Notification not found.", 404);
  const payload = normalizePayload({ title: title ?? existing.title, message: message ?? existing.message, type: type ?? existing.type, link: link ?? existing.link });
  const update = { $set: payload };
  if (userId !== undefined) {
    const cleanUserId = String(userId || "").trim();
    if (!cleanUserId) update.$set.user = null;
    else {
      assertObjectId(cleanUserId, "Invalid user id.");
      const recipient = await User.findById(cleanUserId).select("role").lean();
      if (!recipient) throw makeError("Recipient user not found.", 404);
      if (recipient.role === "admin") throw makeError("Notifications can only be sent to student users.");
      update.$set.user = cleanUserId;
    }
  }
  const updated = await Notification.findByIdAndUpdate(notificationId, update, { new: true, runValidators: true }).populate({ path: "user", select: "name email avatar" }).lean();
  return { ...formatNotification(updated), audience: updated.user ? "individual" : "broadcast" };
};

export const deleteAdminNotification = async (notificationId) => {
  assertObjectId(notificationId, "Invalid notification id.");
  const notification = await Notification.findByIdAndDelete(notificationId).lean();
  if (!notification) throw makeError("Notification not found.", 404);
  return { id: notificationId, deleted: true };
};
