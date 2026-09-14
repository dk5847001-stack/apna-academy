import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { createAdminNotification, deleteAdminNotification, listAdminNotifications } from "../services/admin.notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const data = await listAdminNotifications({ page: req.query?.page, limit: req.query?.limit, search: req.query?.search, type: req.query?.type, audience: req.query?.audience });
  return successResponse({ res, message: "Admin notifications loaded successfully.", data });
});

export const createNotification = asyncHandler(async (req, res) => {
  const data = await createAdminNotification({ userId: req.body?.userId || null, title: req.body?.title, message: req.body?.message, type: req.body?.type, link: req.body?.link });
  return successResponse({ res, statusCode: 201, message: data.audience === "individual" ? "Notification sent to the selected user." : "Broadcast notification sent successfully.", data });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const data = await deleteAdminNotification(req.params.notificationId);
  return successResponse({ res, message: "Notification deleted successfully.", data });
});
