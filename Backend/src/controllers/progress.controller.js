import Course from "../models/Course.js";
import Video from "../models/Video.js";
import Progress from "../models/Progress.js";
import Purchase from "../models/Purchase.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Get or create progress document.
 */
const getOrCreateProgress = async (userId, courseId) => {
  let progress = await Progress.findOne({
    user: userId,
    course: courseId,
  });

  if (!progress) {
    progress = await Progress.create({
      user: userId,
      course: courseId,
      completedVideos: [],
      overallProgress: 0,
      isCompleted: false,
    });
  }

  return progress;
};

/**
 * Calculate overall course progress.
 *
 * Progress is based on ALL published videos
 * in the course.
 */
const calculateProgress = (
  completedCount,
  totalVideos
) => {
  if (!totalVideos || totalVideos <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (completedCount / totalVideos) * 100
    )
  );
};

/**
 * GET /api/v1/progress/courses/:courseId
 *
 * Get user's course progress.
 */
export const getCourseProgress = asyncHandler(
  async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    }).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const progress = await getOrCreateProgress(
      req.user.userId,
      courseId
    );

    const totalVideos = await Video.countDocuments({
      course: courseId,
      isPublished: true,
    });

    const completedVideos =
      progress.completedVideos || [];

    const overallProgress = calculateProgress(
      completedVideos.length,
      totalVideos
    );

    /*
     * Keep stored progress synchronized with
     * the actual number of published videos.
     */
    if (
      progress.overallProgress !== overallProgress
    ) {
      progress.overallProgress = overallProgress;
      progress.isCompleted =
        totalVideos > 0 &&
        completedVideos.length >= totalVideos;

      if (
        progress.isCompleted &&
        !progress.completedAt
      ) {
        progress.completedAt = new Date();
      }

      await progress.save();
    }

    return successResponse({
      res,
      message: "Course progress fetched successfully.",
      data: {
        courseId,
        overallProgress,
        completedVideos,
        completedVideoCount:
          completedVideos.length,
        totalVideos,
        lastWatchedVideo:
          progress.lastWatchedVideo,
        lastWatchedPosition:
          progress.lastWatchedPosition,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
      },
    });
  }
);

/**
 * POST /api/v1/progress/courses/:courseId/videos/:videoId
 *
 * Save video watch position and optionally mark
 * the video as completed.
 *
 * Body:
 * {
 *   "position": 120,
 *   "completed": true
 * }
 */
export const updateVideoProgress =
  asyncHandler(async (req, res) => {
    const { courseId, videoId } =
      req.params;

    const {
      position = 0,
      completed = false,
    } = req.body;

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    }).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    /*
     * Only a paid user can save learning progress.
     */
    const purchase = await Purchase.findOne({
      user: req.user.userId,
      course: courseId,
      paymentStatus: "paid",
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    }).lean();

    if (!purchase) {
      return res.status(403).json({
        success: false,
        message:
          "Please purchase this course first.",
      });
    }

    const video = await Video.findOne({
      _id: videoId,
      course: courseId,
      isPublished: true,
    }).lean();

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    /*
     * Prevent marking a video from a future locked
     * module as completed.
     *
     * All-access users can access every module.
     * Daily users can only access currently unlocked
     * modules.
     */
    if (purchase.unlockMode !== "all_access") {
      const purchaseDate = new Date(
        purchase.purchasedAt
      );

      const now = new Date();

      const purchaseDay = new Date(
        purchaseDate.getFullYear(),
        purchaseDate.getMonth(),
        purchaseDate.getDate()
      );

      const currentDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const millisecondsPerDay =
        24 * 60 * 60 * 1000;

      const elapsedDays = Math.max(
        0,
        Math.floor(
          (currentDay.getTime() -
            purchaseDay.getTime()) /
            millisecondsPerDay
        )
      );

      /*
       * Find the video's module order.
       */
      const Module = (
        await import("../models/Module.js")
      ).default;

      const videoModule =
        await Module.findById(video.module).lean();

      if (!videoModule) {
        return res.status(404).json({
          success: false,
          message: "Video module not found.",
        });
      }

      const highestUnlockedOrder =
        elapsedDays + 1;

      if (
        videoModule.order >
        highestUnlockedOrder
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This module is still locked.",
          code: "MODULE_LOCKED",
        });
      }
    }

    const progress = await getOrCreateProgress(
      req.user.userId,
      courseId
    );

    /*
     * Always update last watched information.
     */
    progress.lastWatchedVideo = videoId;

    const safePosition = Number(position);

    progress.lastWatchedPosition =
      Number.isFinite(safePosition) &&
      safePosition >= 0
        ? safePosition
        : 0;

    /*
     * Mark video completed only when requested.
     */
    if (completed) {
      const alreadyCompleted =
        progress.completedVideos.some(
          (id) =>
            id.toString() ===
            videoId.toString()
        );

      if (!alreadyCompleted) {
        progress.completedVideos.push(videoId);
      }
    }

    /*
     * Recalculate progress from database.
     */
    const totalVideos =
      await Video.countDocuments({
        course: courseId,
        isPublished: true,
      });

    progress.overallProgress =
      calculateProgress(
        progress.completedVideos.length,
        totalVideos
      );

    /*
     * Course completion.
     */
    if (
      totalVideos > 0 &&
      progress.completedVideos.length >=
        totalVideos
    ) {
      progress.isCompleted = true;

      if (!progress.completedAt) {
        progress.completedAt = new Date();
      }
    } else {
      progress.isCompleted = false;
      progress.completedAt = null;
    }

    await progress.save();

    return successResponse({
      res,
      message: completed
        ? "Video completed and progress saved."
        : "Video progress saved.",
      data: {
        courseId,
        videoId,
        overallProgress:
          progress.overallProgress,
        completedVideos:
          progress.completedVideos,
        lastWatchedVideo:
          progress.lastWatchedVideo,
        lastWatchedPosition:
          progress.lastWatchedPosition,
        isCompleted:
          progress.isCompleted,
        completedAt:
          progress.completedAt,
      },
    });
  });