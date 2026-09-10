import { Router } from "express";

import {
  getCourseProgress,
  updateVideoProgress,
} from "../controllers/progress.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Get current user's progress for a course.
 *
 * GET /api/v1/progress/courses/:courseId
 */
router.get(
  "/courses/:courseId",
  authenticate,
  getCourseProgress
);

/**
 * Save video watch position / completion.
 *
 * POST /api/v1/progress/courses/:courseId/videos/:videoId
 */
router.post(
  "/courses/:courseId/videos/:videoId",
  authenticate,
  updateVideoProgress
);

export default router;