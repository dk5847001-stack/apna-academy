import { Router } from "express";

import {
  getLearningCourse,
  getLearningVideo,
} from "../controllers/learning.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Get learning structure for an authenticated user.
 *
 * GET /api/v1/learning/courses/:courseId
 */
router.get(
  "/courses/:courseId",
  authenticate,
  getLearningCourse
);

/**
 * Get a specific video after server-side authorization.
 *
 * GET /api/v1/learning/courses/:courseId/videos/:videoId
 */
router.get(
  "/courses/:courseId/videos/:videoId",
  authenticate,
  getLearningVideo
);

export default router;