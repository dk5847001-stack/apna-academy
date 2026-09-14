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

const escapeRegex = (value) =>
  value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatNotification = (item) => ({
  id: item._id?.toString(),
  title: item.title,
  message: item.message,
  type: item.type,
  link: item.link || "",
  isRead: Boolean(item.isRead),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  user: item.user
    ? {
        id: item.user._id?.toString(),
        name: item.user.name || "",
        email: item.user.email || "",
        avatar: item.user.avatar || "",
      }
    : null,
});

const assertObjectId = (value, message = "Invalid user id.") => {
  if (!isObjectId(value)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

export const listAdminNotifications = async ({
  page = 1,
  limit = 20,
  search = "",
  type = "",
  audience = "",
} = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (type && TYPES.has(type)) query.type = type;
  if (audience === "broadcast") query.user = null;
  if (audience === "individual") query.user = { $ne: null };

  if (search?.trim()) {
    const escaped = escapeRegex(search);
    const userIds = await User.find({
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ],
    }).distinct("_id");

    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { message: { $regex: escaped, $options: "i" } },
      { user: { $in: userIds } },
    ];
  }

  const skip = (safePage - 1) * safeLimit;
  const [rows, total] = await Promise.all([
    Notification.find(query)
      .populate({ path: "user", select: "name email avatar" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Notification.countDocuments(query),
  ]);

  return {
    notifications: rows.map(formatNotification),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const createAdminNotification = async ({
  userId = null,
  title,
  message,
  type = "system",
  link = "",
} = {}) => {
  const cleanTitle = String(title || "").trim();
  const cleanMessage = String(message || "").trim();
  const cleanType = String(type || "system").trim();
  const cleanLink = String(link || "").trim();

  if (!cleanTitle) {
    const error = new Error("Notification title is required.");
    error.statusCode = 400;
    throw error;
  }
  if (!cleanMessage) {
    const error = new Error("Notification message is required.");
    error.statusCode = 400;
    throw error;
  }
  if (cleanTitle.length > 200) {
    const error = new Error("Notification title cannot exceed 200 characters.");
    error.statusCode = 400;
    throw error;
  }
  if (cleanMessage.length > 1000) {
    const error = new Error("Notification message cannot exceed 1000 characters.");
    error.statusCode = 400;
    throw error;
  }
  if (!TYPES.has(cleanType)) {
    const error = new Error("Invalid notification type.");
    error.statusCode = 400;
    throw error;
  }

  let recipient = null;
  if (userId) {
    assertObjectId(userId);
    recipient = await User.findById(userId).select("name email avatar status").lean();
    if (!recipient) {
      const error = new Error("Recipient user not found.");
      error.statusCode = 404;
      throw error;
    }
  }

  const notification = await Notification.create({
    user: userId || null,
    title: cleanTitle,
    message: cleanMessage,
    type: cleanType,
    link: cleanLink,
    isRead: false,
  });

  return {
    ...formatNotification({
      ...notification.toObject(),
      user: recipient,
    }),
    audience: userId ? "individual" : "broadcast",
  };
};

export const deleteAdminNotification = async (notificationId) => {
  assertObjectId(notificationId, "Invalid notification id.");
  const notification = await Notification.findByIdAndDelete(notificationId).lean();
  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }
  return { id: notificationId, deleted: true };
};
