import SupportTicket from "../models/SupportTicket.js";

const sanitizeText = (value = "") =>
  String(value).trim();

const serializeTicket = (ticket) => ({
  id: ticket._id,
  subject: ticket.subject,
  category: ticket.category,
  message: ticket.message,
  status: ticket.status,
  priority: ticket.priority,
  adminReply: ticket.adminReply || "",
  repliedAt: ticket.repliedAt || null,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

const validateCategory = (category) =>
  ["course", "payment", "video", "certificate", "account", "other"].includes(category)
    ? category
    : "other";

const validatePriority = (priority) =>
  ["low", "medium", "high", "urgent"].includes(priority)
    ? priority
    : "medium";

export const createSupportTicket = async ({
  userId,
  subject,
  category,
  message,
  priority,
}) => {
  const cleanSubject = sanitizeText(subject);
  const cleanMessage = sanitizeText(message);

  if (cleanSubject.length < 3) {
    const error = new Error("Subject must be at least 3 characters.");
    error.statusCode = 400;
    throw error;
  }

  if (cleanMessage.length < 10) {
    const error = new Error("Message must be at least 10 characters.");
    error.statusCode = 400;
    throw error;
  }

  if (cleanSubject.length > 200) {
    const error = new Error("Subject cannot exceed 200 characters.");
    error.statusCode = 400;
    throw error;
  }

  if (cleanMessage.length > 5000) {
    const error = new Error("Message cannot exceed 5000 characters.");
    error.statusCode = 400;
    throw error;
  }

  const ticket = await SupportTicket.create({
    user: userId,
    subject: cleanSubject,
    category: validateCategory(category),
    message: cleanMessage,
    priority: validatePriority(priority),
  });

  return serializeTicket(ticket);
};

export const getUserSupportTickets = async ({
  userId,
  status,
}) => {
  const filter = { user: userId };

  if (["open", "in-progress", "resolved", "closed"].includes(status)) {
    filter.status = status;
  }

  const tickets = await SupportTicket.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return tickets.map(serializeTicket);
};

export const getUserSupportTicket = async ({
  userId,
  ticketId,
}) => {
  const ticket = await SupportTicket.findOne({
    _id: ticketId,
    user: userId,
  }).lean();

  if (!ticket) {
    const error = new Error("Support ticket not found.");
    error.statusCode = 404;
    throw error;
  }

  return serializeTicket(ticket);
};
