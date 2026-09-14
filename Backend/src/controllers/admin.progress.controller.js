import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAdminProgress, listAdminProgress } from "../services/admin.progress.service.js";

export const listProgress = asyncHandler(async (req, res) => {
  const data = await listAdminProgress({
    page: req.query?.page,
    limit: req.query?.limit,
    search: req.query?.search,
    courseId: req.query?.courseId,
    completed: req.query?.completed,
  });
  return successResponse({ res, message: "Progress records loaded successfully.", data });
});

export const getProgress = asyncHandler(async (req, res) => {
  const data = await getAdminProgress(req.params.progressId);
  return successResponse({ res, message: "Progress record loaded successfully.", data });
});
