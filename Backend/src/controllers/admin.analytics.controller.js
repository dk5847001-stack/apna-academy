import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAdminAnalytics } from "../services/admin.analytics.service.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const { preset, from, to } = req.query;
  const data = await getAdminAnalytics({ preset, from, to });
  return successResponse({ res, message: "Admin analytics loaded successfully.", data });
});
