import { getAdminTicket, listAdminTickets, listSupportAdmins, updateAdminTicket, bulkUpdateAdminTickets } from "../services/admin.support.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const listTickets = asyncHandler(async (req, res) => {
  const data = await listAdminTickets({ page: req.query?.page, limit: req.query?.limit, search: req.query?.search, status: req.query?.status, priority: req.query?.priority, category: req.query?.category, assignedAdmin: req.query?.assignedAdmin });
  return successResponse({ res, message: "Support tickets loaded successfully.", data });
});

export const getTicket = asyncHandler(async (req, res) => {
  const data = await getAdminTicket(req.params.ticketId);
  return successResponse({ res, message: "Support ticket loaded successfully.", data });
});

export const getSupportAdmins = asyncHandler(async (req, res) => {
  const data = await listSupportAdmins();
  return successResponse({ res, message: "Support admins loaded successfully.", data });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const data = await updateAdminTicket({ ticketId: req.params.ticketId, status: req.body?.status, priority: req.body?.priority, adminReply: req.body?.adminReply, adminId: req.user?.userId, assignedAdmin: req.body?.assignedAdmin });
  return successResponse({ res, message: "Support ticket updated successfully.", data });
});

export const bulkUpdateTickets = asyncHandler(async (req, res) => {
  const data = await bulkUpdateAdminTickets({ ticketIds: req.body?.ticketIds, status: req.body?.status, adminId: req.user?.userId });
  return successResponse({ res, message: "Support tickets updated successfully.", data });
});
