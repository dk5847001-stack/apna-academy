import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { streamDriveVideo } from "../controllers/driveVideo.controller.js";

const router = Router();

/**
 * Authenticated Google Drive video stream.
 *
 * GET /api/v1/videos/courses/:courseId/videos/:videoId/stream
 *
 * The endpoint preserves Range requests so the browser can use a native
 * HTMLMediaElement and expose currentTime/duration for accurate progress.
 */
router.get(
  "/courses/:courseId/videos/:videoId/stream",
  authenticate,
  streamDriveVideo
);

export default router;
