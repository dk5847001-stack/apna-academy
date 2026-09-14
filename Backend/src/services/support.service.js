import mongoose from "mongoose";
import SupportTicket from "../models/SupportTicket.js";
import SupportMessage from "../models/SupportMessage.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const sanitizeText = (value) => String(value ?? "").trim();
const STATUSES = ["open", "in-progress", "resolved", "closed"];
const validateCategory = (category) => ["course", "payment", "video", "certificate", "account", "other"].includes(category) ? category : "other";
const validatePriority = (priority) => ["low", "medium", "high", "urgent"].includes(priority) ? priority : "medium";
const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid support ticket id.");
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
const serializeTicket = (ticket, messages = [], lastMessage = null) => ({
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
});

export const createSupportTicket = async ({ userId, subject, category, message, priority }) => {
  const cleanSubject = sanitizeText(subject);
  const cleanMessage = sanitizeText(message);
  if (cleanSubject.length < 3 || cleanSubject.length > 200) { const error = new Error("Subject must be between 3 and 200 characters."); error.statusCode = 400; throw error; }
  if (cleanMessage.length < 10 || cleanMessage.length > 5000) { const error = new Error("Message must be between 10 and 5000 characters."); error.statusCode = 400; throw error; }
  const ticket = await SupportTicket.create({ user: userId, subject: cleanSubject, category: validateCategory(category), message: cleanMessage, priority: validatePriority(priority) });
  await SupportMessage.create({ ticket: ticket._id, sender: userId, senderRole: "user", message: cleanMessage });
  const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
  await Notification.insertMany(admins.map((admin) => ({ user: admin._id, title: `New support ticket: ${cleanSubject}`, message: `A student opened a ${ticket.priority} priority support ticket.`, type: "system", link: "/admin/support" })));
  return serializeTicket(ticket, []);
};

export const getUserSupportTickets = async ({ userId, status }) => {
  const filter = { user: userId };
  if (STATUSES.includes(status)) filter.status = status;
  const tickets = await SupportTicket.find(filter).sort({ updatedAt: -1 }).lean();
  const ids = tickets.map((ticket) => ticket._id);
  const latest = ids.length ? await SupportMessage.find({ ticket: { $in: ids } }).sort({ createdAt: -1 }).lean() : [];
  const map = new Map();
  for (const message of latest) if (!map.has(message.ticket.toString())) map.set(message.ticket.toString(), serializeMessage(message));
  return tickets.map((ticket) => serializeTicket(ticket, [], map.get(ticket._id.toString())));
};

export const getUserSupportTicket = async ({ userId, ticketId }) => {
  validateId(ticketId);
  const ticket = await SupportTicket.findOne({ _id: ticketId, user: userId }).lean();
  if (!ticket) { const error = new Error("Support ticket not found."); error.statusCode = 404; throw error; }
  const messages = await SupportMessage.find({ ticket: ticket._id }).populate({ path: "sender", select: "name email avatar" }).sort({ createdAt: 1 }).lean();
  return serializeTicket(ticket, messages.map(serializeMessage));
};

export const replyToSupportTicket = async ({ userId, ticketId, message }) => {
  validateId(ticketId);
  const cleanMessage = sanitizeText(message);
  if (cleanMessage.length < 1 || cleanMessage.length > 5000) { const error = new Error("Reply must be between 1 and 5000 characters."); error.statusCode = 400; throw error; }
  const ticket = await SupportTicket.findOne({ _id: ticketId, user: userId });
  if (!ticket) { const error = new Error("Support ticket not found."); error.statusCode = 404; throw error; }
  if (ticket.status === "closed") { const error = new Error("Closed tickets cannot receive new replies."); error.statusCode = 400; throw error; }
  await SupportMessage.create({ ticket: ticket._id, sender: userId, senderRole: "user", message: cleanMessage });
  ticket.status = "open";
  await ticket.save();
  const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
  await Notification.insertMany(admins.map((admin) => ({ user: admin._id, title: `New student reply: ${ticket.subject}`, message: "A student has replied to a support conversation.", type: "system", link: "/admin/support" })));
  return getUserSupportTicket({ userId, ticketId });
};
