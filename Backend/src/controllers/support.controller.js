import { createSupportTicket, getUserSupportTicket, getUserSupportTickets, replyToSupportTicket } from "../services/support.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const getUserId = (req) => req.user?.userId;

export const createTicket = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
  const ticket = await createSupportTicket({ userId, subject: req.body?.subject, category: req.body?.category, message: req.body?.message, priority: req.body?.priority });
  return successResponse({ res, statusCode: 201, message: "Support ticket created successfully.", data: ticket });
});

export const getTickets = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
  const tickets = await getUserSupportTickets({ userId, status: req.query?.status });
  return successResponse({ res, message: "Support tickets loaded successfully.", data: tickets });
});

export const getTicket = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
  const ticket = await getUserSupportTicket({ userId, ticketId: req.params.ticketId });
  return successResponse({ res, message: "Support ticket loaded successfully.", data: ticket });
});

export const replyTicket = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
  const ticket = await replyToSupportTicket({ userId, ticketId: req.params.ticketId, message: req.body?.message });
  return successResponse({ res, message: "Support reply sent successfully.", data: ticket });
});
