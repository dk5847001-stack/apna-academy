import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { indexCourseKnowledge } from "../services/ai.rag.service.js";

export const indexCourseAIKnowledge = asyncHandler(async (req, res) => {
  const data = await indexCourseKnowledge(req.params.courseId);
  return successResponse({
    res,
    message: "Course AI knowledge indexed successfully.",
    data,
  });
});
