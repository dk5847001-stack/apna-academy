import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAdminAnalytics } from "../services/admin.analytics.service.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await getAdminAnalytics();
  return successResponse({ res, message: "Admin analytics loaded successfully.", data });
});
