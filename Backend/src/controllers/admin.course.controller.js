import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

import {
  listAdminCourses,
  getAdminCourse,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  createAdminModule,
  updateAdminModule,
  deleteAdminModule,
  createAdminVideo,
  updateAdminVideo,
  deleteAdminVideo,
} from "../services/admin.course.service.js";

export const listCourses = asyncHandler(async (req, res) => {
  const data = await listAdminCourses(req.query);
  return successResponse({ res, message: "Admin courses fetched successfully.", data });
});

export const getCourse = asyncHandler(async (req, res) => {
  const data = await getAdminCourse(req.params.courseId);
  return successResponse({ res, message: "Admin course fetched successfully.", data });
});

export const createCourse = asyncHandler(async (req, res) => {
  const data = await createAdminCourse(req.body);
  return successResponse({ res, statusCode: 201, message: "Course created successfully.", data });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const data = await updateAdminCourse(req.params.courseId, req.body);
  return successResponse({ res, message: "Course updated successfully.", data });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const data = await deleteAdminCourse(req.params.courseId);
  return successResponse({ res, message: "Course deleted successfully.", data });
});

export const createModule = asyncHandler(async (req, res) => {
  const data = await createAdminModule(req.params.courseId, req.body);
  return successResponse({ res, statusCode: 201, message: "Module created successfully.", data });
});

export const updateModule = asyncHandler(async (req, res) => {
  const data = await updateAdminModule(req.params.moduleId, req.body);
  return successResponse({ res, message: "Module updated successfully.", data });
});

export const deleteModule = asyncHandler(async (req, res) => {
  const data = await deleteAdminModule(req.params.moduleId);
  return successResponse({ res, message: "Module deleted successfully.", data });
});

export const createVideo = asyncHandler(async (req, res) => {
  const data = await createAdminVideo(req.params.moduleId, req.body);
  return successResponse({ res, statusCode: 201, message: "Video created successfully.", data });
});

export const updateVideo = asyncHandler(async (req, res) => {
  const data = await updateAdminVideo(req.params.videoId, req.body);
  return successResponse({ res, message: "Video updated successfully.", data });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const data = await deleteAdminVideo(req.params.videoId);
  return successResponse({ res, message: "Video deleted successfully.", data });
});
