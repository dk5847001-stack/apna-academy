import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { listAdminAssessments, getAdminAssessment, createAdminAssessment, updateAdminAssessment, deleteAdminAssessment } from "../services/admin.assessment.service.js";

export const listAssessments = asyncHandler(async (req, res) => successResponse({ res, message: "Assessments loaded successfully.", data: await listAdminAssessments() }));
export const getAssessment = asyncHandler(async (req, res) => successResponse({ res, message: "Assessment loaded successfully.", data: await getAdminAssessment(req.params.assessmentId) }));
export const createAssessment = asyncHandler(async (req, res) => successResponse({ res, message: "Assessment created successfully.", data: await createAdminAssessment(req.body || {}) }));
export const updateAssessment = asyncHandler(async (req, res) => successResponse({ res, message: "Assessment updated successfully.", data: await updateAdminAssessment({ assessmentId: req.params.assessmentId, ...(req.body || {}) }) }));
export const deleteAssessment = asyncHandler(async (req, res) => successResponse({ res, message: "Assessment deleted successfully.", data: await deleteAdminAssessment(req.params.assessmentId) }));
