import mongoose from "mongoose";
import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const STATUSES = ["open", "in-progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const CATEGORIES = ["course", "payment", "video", "certificate", "account", "other"];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const clean = (value = "") => String(value).trim();

const serialize = (ticket) => ({
  id: ticket._id?.toString(),
  subject: ticket.subject,
  category: ticket.category,
  message: ticket.message,
  status: ticket.status,
  priority: ticket.priority,
  adminReply: ticket.adminReply || "",
  repliedAt: ticket.repliedAt || null,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  user: ticket.user
    ? {
        id: ticket.user._id?.toString(),
        name: ticket.user.name,
        email: ticket.user.email,
        phone: ticket.user.phone || "",
        avatar: ticket.user.avatar || "",
      }
    : null,
});

const validateId = (id) => {
  if (!isObjectId(id)) {
    const error = new Error("Invalid ticket id.");
    error.statusCode = 400;
    throw error;
  }
};

export const listAdminTickets = async ({ page = 1, limit = 20, search = "", status = "", priority = "", category = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (STATUSES.includes(status)) query.status = status;
  if (PRIORITIES.includes(priority)) query.priority = priority;
  if (CATEGORIES.includes(category)) query.category = category;

  if (clean(search)) {
    const escaped = clean(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const userIds = await User.find({
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ],
    }).distinct("_id");
    query.$or = [
      { subject: { $regex: escaped, $options: "i" } },
      { message: { $regex: escaped, $options: "i" } },
      { adminReply: { $regex: escaped, $options: "i" } },
      { user: { $in: userIds } },
    ];
  }

  const skip = (safePage - 1) * safeLimit;
  const [rows, total, counts] = await Promise.all([
    SupportTicket.find(query)
      .populate({ path: "user", select: "name email phone avatar" })
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    SupportTicket.countDocuments(query),
    Promise.all(
      STATUSES.map(async (item) => [item, await SupportTicket.countDocuments({ status: item })])
    ),
  ]);

  const summary = Object.fromEntries(counts);
  summary.total = Object.values(summary).reduce((sum, value) => sum + Number(value || 0), 0);

  return {
    tickets: rows.map(serialize),
    summary,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
};

export const getAdminTicket = async (ticketId) => {
  validateId(ticketId);
  const ticket = await SupportTicket.findById(ticketId)
    .populate({ path: "user", select: "name email phone avatar role status isEmailVerified createdAt lastLoginAt" })
    .lean();
  if (!ticket) {
    const error = new Error("Support ticket not found.");
    error.statusCode = 404;
    throw error;
  }
  return serialize(ticket);
};

export const updateAdminTicket = async ({ ticketId, status, priority, adminReply }) => {
  validateId(ticketId);
  const updates = {};
  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      const error = new Error("Invalid ticket status.");
      error.statusCode = 400;
      throw error;
    }
    updates.status = status;
  }
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) {
      const error = new Error("Invalid ticket priority.");
      error.statusCode = 400;
      throw error;
    }
    updates.priority = priority;
  }
  if (adminReply !== undefined) {
    const reply = clean(adminReply);
    if (reply.length > 5000) {
      const error = new Error("Admin reply cannot exceed 5000 characters.");
      error.statusCode = 400;
      throw error;
    }
    updates.adminReply = reply;
    if (reply) updates.repliedAt = new Date();
  }

  if (!Object.keys(updates).length) {
    const error = new Error("No valid ticket changes supplied.");
    error.statusCode = 400;
    throw error;
  }

  const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { $set: updates }, { new: true })
    .populate({ path: "user", select: "name email phone avatar" })
    .lean();
  if (!ticket) {
    const error = new Error("Support ticket not found.");
    error.statusCode = 404;
    throw error;
  }

  const notificationParts = [];
  if (adminReply !== undefined && clean(adminReply)) notificationParts.push("Our support team replied to your ticket.");
  if (status !== undefined) notificationParts.push(`Ticket status updated to ${status.replace("-", " ")}.`);
  if (priority !== undefined) notificationParts.push(`Ticket priority updated to ${priority}.`);

  if (notificationParts.length && ticket.user?._id) {
    await Notification.create({
      user: ticket.user._id,
      title: `Support update: ${ticket.subject}`,
      message: notificationParts.join(" "),
      type: "system",
      link: "/dashboard/support",
    });
  }

  return serialize(ticket);
};
