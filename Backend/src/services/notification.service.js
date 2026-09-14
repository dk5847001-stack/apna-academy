import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const normalizeNotification = (notification, userId) => ({
  _id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  link: notification.link || "",
  isRead: notification.user === null
    ? Boolean(notification.readBy?.some((id) => id?.toString() === userId.toString()))
    : Boolean(notification.isRead),
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export const getUserNotifications = async (userId, { limit = 50 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const notifications = await Notification.find({ $or: [{ user: userId }, { user: null }] })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
  const normalized = notifications.map((notification) => normalizeNotification(notification, userId));
  return { notifications: normalized, unreadCount: normalized.filter((notification) => !notification.isRead).length };
};

export const markNotificationAsRead = async ({ userId, notificationId }) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }
  const notification = await Notification.findOne({ _id: notificationId, $or: [{ user: userId }, { user: null }] }).lean();
  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }
  const updated = notification.user === null
    ? await Notification.findByIdAndUpdate(notificationId, { $addToSet: { readBy: userId } }, { new: true }).lean()
    : await Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { $set: { isRead: true } }, { new: true }).lean();
  return normalizeNotification(updated, userId);
};

export const markAllNotificationsAsRead = async (userId) => {
  const [privateResult, broadcastResult] = await Promise.all([
    Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } }),
    Notification.updateMany({ user: null, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } }),
  ]);
  return { updatedCount: (privateResult.modifiedCount || 0) + (broadcastResult.modifiedCount || 0) };
};