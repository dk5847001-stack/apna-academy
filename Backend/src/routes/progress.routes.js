import { Router } from "express";

import {
  getCourseProgress,
  completeVideoLesson,
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
 * Mark one lesson complete when the user selects it.
 *
 * POST /api/v1/progress/courses/:courseId/videos/:videoId/complete
 */
router.post(
  "/courses/:courseId/videos/:videoId/complete",
  authenticate,
  completeVideoLesson
);

export default router;
