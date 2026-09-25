import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAdminAIUsage, getMyAIUsage } from "../services/aiUsage.service.js";

export const getMyUsage = asyncHandler(async (req, res) => {
  const data = await getMyAIUsage({
    userId: req.user?.userId,
    preset: req.query?.preset,
  });
  return successResponse({ res, message: "AI usage loaded successfully.", data });
});

export const getAdminUsage = asyncHandler(async (req, res) => {
  const data = await getAdminAIUsage({
    preset: req.query?.preset,
    from: req.query?.from,
    to: req.query?.to,
    courseId: req.query?.courseId,
    feature: req.query?.feature,
  });
  return successResponse({ res, message: "AI usage analytics loaded successfully.", data });
});
