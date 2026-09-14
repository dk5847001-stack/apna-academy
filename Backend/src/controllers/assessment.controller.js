import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getStudentAssessment, submitStudentAssessment } from "../services/assessment.service.js";

export const getAssessment = asyncHandler(async (req, res) => {
  const data = await getStudentAssessment({ userId: req.user.userId, courseId: req.params.courseId });
  return successResponse({ res, message: "Assessment loaded successfully.", data });
});

export const submitAssessment = asyncHandler(async (req, res) => {
  const data = await submitStudentAssessment({ userId: req.user.userId, courseId: req.params.courseId, answers: req.body?.answers });
  return successResponse({ res, message: data.passed ? "Assessment passed successfully." : "Assessment submitted successfully.", data });
});
