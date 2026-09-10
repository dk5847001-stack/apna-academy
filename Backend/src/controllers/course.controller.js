import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

import {
  getPublishedCourses,
  getPublishedCourseBySlug,
} from "../services/course.service.js";

/**
 * GET /api/v1/courses
 */
export const getCourses = asyncHandler(
  async (req, res) => {
    const {
      page,
      limit,
      search,
      category,
      level,
      featured,
    } = req.query;

    const result = await getPublishedCourses({
      page,
      limit,
      search,
      category,
      level,
      featured,
    });

    return successResponse({
      res,
      message: "Courses fetched successfully.",
      data: result,
    });
  }
);

/**
 * GET /api/v1/courses/:slug
 */
export const getCourseBySlug = asyncHandler(
  async (req, res) => {
    const result = await getPublishedCourseBySlug(
      req.params.slug
    );

    return successResponse({
      res,
      message: "Course details fetched successfully.",
      data: result,
    });
  }
);