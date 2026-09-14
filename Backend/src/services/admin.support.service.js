import mongoose from "mongoose";
import SupportTicket from "../models/SupportTicket.js";
import SupportMessage from "../models/SupportMessage.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const STATUSES = ["open", "in-progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const CATEGORIES = ["course", "payment", "video", "certificate", "account", "other"];
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const clean = (value) => String(value ?? "").trim();
const validateId = (id) => {
  if (!isObjectId(id)) {
    const error = new Error("Invalid ticket id.");
    error.statusCode = 400;
    throw error;
  }
};
const serializeMessage = (message) => ({
  id: message._id?.toString(),
  sender: message.sender ? { id: message.sender._id?.toString(), name: message.sender.name, email: message.sender.email, avatar: message.sender.avatar || "" } : null,
  senderRole: message.senderRole,
  message: message.message,
  createdAt: message.createdAt,
});
const serialize = (ticket, messages = [], lastMessage = null) => ({
  id: ticket._id?.toString(),
  subject: ticket.subject,
  category: ticket.category,
  message: ticket.message,
  status: ticket.status,
  priority: ticket.priority,
  adminReply: ticket.adminReply || "",
  repliedAt: ticket.repliedAt || null,
  firstResponseAt: ticket.firstResponseAt || null,
  resolvedAt: ticket.resolvedAt || null,
  assignedAdmin: ticket.assignedAdmin ? { id: ticket.assignedAdmin._id?.toString(), name: ticket.assignedAdmin.name, email: ticket.assignedAdmin.email, avatar: ticket.assignedAdmin.avatar || "" } : null,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  lastMessage: messages.length ? messages[messages.length - 1] : lastMessage,
  messages,
  user: ticket.user ? { id: ticket.user._id?.toString(), name: ticket.user.name, email: ticket.user.email, phone: ticket.user.phone || "", avatar: ticket.user.avatar || "" } : null,
});

export const listAdminTickets = async ({ page = 1, limit = 20, search = "", status = "", priority = "", category = "", assignedAdmin = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};
  if (STATUSES.includes(status)) query.status = status;
  if (PRIORITIES.includes(priority)) query.priority = priority;
  if (CATEGORIES.includes(category)) query.category = category;
  if (assignedAdmin === "unassigned") query.assignedAdmin = null;
  else if (isObjectId(assignedAdmin)) query.assignedAdmin = assignedAdmin;
  if (clean(search)) {
    const escaped = clean(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const userIds = await User.find({ $or: [{ name: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }] }).distinct("_id");
    query.$or = [{ subject: { $regex: escaped, $options: "i" } }, { message: { $regex: escaped, $options: "i" } }, { adminReply: { $regex: escaped, $options: "i" } }, { user: { $in: userIds } }];
  }
  const skip = (safePage - 1) * safeLimit;
  const [rows, total, counts] = await Promise.all([
    SupportTicket.find(query).populate({ path: "user", select: "name email phone avatar" }).populate({ path: "assignedAdmin", select: "name email avatar" }).sort({ priority: -1, updatedAt: -1 }).skip(skip).limit(safeLimit).lean(),
    SupportTicket.countDocuments(query),
    Promise.all(STATUSES.map(async (value) => [value, await SupportTicket.countDocuments({ status: value })])),
  ]);
  const ids = rows.map((ticket) => ticket._id);
  const latest = ids.length ? await SupportMessage.find({ ticket: { $in: ids } }).sort({ createdAt: -1 }).lean() : [];
  const latestMap = new Map();
  for (const message of latest) if (!latestMap.has(message.ticket.toString())) latestMap.set(message.ticket.toString(), serializeMessage(message));
  const summary = Object.fromEntries(counts);
  summary.total = Object.values(summary).reduce((sum, value) => sum + Number(value || 0), 0);
  const attentionQuery = { ...query, status: { $nin: ["closed", "resolved"] } };
  const attentionIds = await SupportTicket.find(attentionQuery).select("_id").lean();
  const attentionMessages = attentionIds.length ? await SupportMessage.find({ ticket: { $in: attentionIds.map((item) => item._id) }, senderRole: "user" }).sort({ createdAt: -1 }).lean() : [];
  const latestUserByTicket = new Set();
  for (const message of attentionMessages) if (!latestUserByTicket.has(message.ticket.toString())) latestUserByTicket.add(message.ticket.toString());
  summary.needsReply = latestUserByTicket.size;
  summary.assigned = await SupportTicket.countDocuments({ ...query, assignedAdmin: { $ne: null } });
  summary.unassigned = await SupportTicket.countDocuments({ ...query, assignedAdmin: null });
  const responseTimes = await SupportTicket.find({ ...query, firstResponseAt: { $ne: null } }).select("createdAt firstResponseAt").lean();
  summary.averageFirstResponseMinutes = responseTimes.length ? Math.round(responseTimes.reduce((sum, item) => sum + ((new Date(item.firstResponseAt) - new Date(item.createdAt)) / 60000), 0) / responseTimes.length) : 0;
  return {
    tickets: rows.map((ticket) => serialize(ticket, [], latestMap.get(ticket._id.toString()))),
    summary,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
};

export const getAdminTicket = async (ticketId) => {
  validateId(ticketId);
  const ticket = await SupportTicket.findById(ticketId).populate({ path: "user", select: "name email phone avatar role status isEmailVerified createdAt lastLoginAt" }).populate({ path: "assignedAdmin", select: "name email avatar role status" }).lean();
  if (!ticket) {
    const error = new Error("Support ticket not found.");
    error.statusCode = 404;
    throw error;
  }
  const messages = await SupportMessage.find({ ticket: ticket._id }).populate({ path: "sender", select: "name email avatar" }).sort({ createdAt: 1 }).lean();
  const firstAdminMessage = messages.find((message) => message.senderRole === "admin");
  return serialize(ticket, messages.map(serializeMessage), messages.length ? serializeMessage(messages[messages.length - 1]) : null);
};

export const listSupportAdmins = async () => User.find({ role: "admin", status: "active" }).select("name email avatar").sort({ name: 1 }).lean();

const notifyUser = async ({ userId, title, message, link = "/dashboard/support" }) => {
  if (userId) await Notification.create({ user: userId, title, message, type: "system", link });
};

export const updateAdminTicket = async ({ ticketId, status, priority, adminReply, adminId, assignedAdmin } = {}) => {
  validateId(ticketId);
  const updates = {};
  if (status !== undefined) {
    if (!STATUSES.includes(status)) { const error = new Error("Invalid ticket status."); error.statusCode = 400; throw error; }
    updates.status = status;
    if (status === "resolved") updates.resolvedAt = new Date();
    if (status !== "resolved") updates.resolvedAt = null;
  }
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) { const error = new Error("Invalid ticket priority."); error.statusCode = 400; throw error; }
    updates.priority = priority;
  }
  if (assignedAdmin !== undefined) {
    if (assignedAdmin === null || assignedAdmin === "") updates.assignedAdmin = null;
    else {
      validateId(assignedAdmin);
      const admin = await User.findOne({ _id: assignedAdmin, role: "admin", status: "active" }).select("_id").lean();
      if (!admin) { const error = new Error("Assigned admin is invalid or inactive."); error.statusCode = 400; throw error; }
      updates.assignedAdmin = assignedAdmin;
    }
  }
  const reply = adminReply === undefined ? "" : clean(adminReply);
  if (adminReply !== undefined) {
    if (reply.length > 5000) { const error = new Error("Admin reply cannot exceed 5000 characters."); error.statusCode = 400; throw error; }
    if (reply) {
      updates.adminReply = reply;
      updates.repliedAt = new Date();
      updates.firstResponseAt = (await SupportTicket.findById(ticketId).select("firstResponseAt").lean())?.firstResponseAt || new Date();
    }
  }
  if (!Object.keys(updates).length) { const error = new Error("No valid ticket changes supplied."); error.statusCode = 400; throw error; }
  const before = await SupportTicket.findById(ticketId).select("status priority assignedAdmin firstResponseAt user subject").lean();
  if (!before) { const error = new Error("Support ticket not found."); error.statusCode = 404; throw error; }
  const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { $set: updates }, { new: true }).populate({ path: "user", select: "name email phone avatar" }).populate({ path: "assignedAdmin", select: "name email avatar" }).lean();
  if (reply) await SupportMessage.create({ ticket: ticket._id, sender: adminId, senderRole: "admin", message: reply });
  const parts = [];
  if (reply) parts.push("Our support team replied to your ticket.");
  if (status !== undefined && status !== before.status) parts.push(`Ticket status updated to ${status.replace("-", " ")}.`);
  if (priority !== undefined && priority !== before.priority) parts.push(`Ticket priority updated to ${priority}.`);
  if (assignedAdmin !== undefined && String(assignedAdmin || "") !== String(before.assignedAdmin || "")) parts.push(assignedAdmin ? "Your ticket has been assigned to a support admin." : "Your ticket is now unassigned.");
  if (parts.length) await notifyUser({ userId: ticket.user?._id, title: `Support update: ${ticket.subject}`, message: parts.join(" ") });
  return getAdminTicket(ticketId);
};

export const bulkUpdateAdminTickets = async ({ ticketIds = [], status, adminId } = {}) => {
  if (!Array.isArray(ticketIds) || ticketIds.length < 1 || ticketIds.length > 100) { const error = new Error("Select between 1 and 100 tickets."); error.statusCode = 400; throw error; }
  if (!STATUSES.includes(status)) { const error = new Error("Invalid bulk status."); error.statusCode = 400; throw error; }
  const ids = [...new Set(ticketIds.map(String))];
  if (ids.some((id) => !isObjectId(id))) { const error = new Error("One or more ticket ids are invalid."); error.statusCode = 400; throw error; }
  const tickets = await SupportTicket.find({ _id: { $in: ids } }).select("_id user subject status").lean();
  if (!tickets.length) { const error = new Error("No matching tickets found."); error.statusCode = 404; throw error; }
  const now = new Date();
  const update = { status };
  if (status === "resolved") update.resolvedAt = now;
  if (status !== "resolved") update.resolvedAt = null;
  await SupportTicket.updateMany({ _id: { $in: tickets.map((ticket) => ticket._id) } }, { $set: update });
  await Promise.all(tickets.filter((ticket) => ticket.user).map((ticket) => notifyUser({ userId: ticket.user, title: `Support update: ${ticket.subject}`, message: `Ticket status updated to ${status.replace("-", " ")}.` })));
  return { updated: tickets.length, status };
};
