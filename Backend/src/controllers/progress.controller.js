import Course from "../models/Course.js";
import Video from "../models/Video.js";
import Progress from "../models/Progress.js";

import {
  getActiveCoursePurchase,
  canAccessVideo,
} from "../services/purchase.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Progress is lesson-click based.
 *
 * A lesson becomes completed when an authenticated, purchased user
 * clicks/selects that lesson from the learning sidebar.
 *
 * Overall progress:
 *   completed lessons / total published lessons * 100
 *
 * Example:
 *   100 total lessons + 1 completed = 1%
 *   100 total lessons + 50 completed = 50%
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

const getValidProgressSnapshot = async (courseId, progress) => {
  const publishedVideoIds = await Video.find({
    course: courseId,
    isPublished: true,
  })
    .select("_id")
    .lean();

  const validVideoIdSet = new Set(
    publishedVideoIds.map((video) => String(video._id))
  );

  // Keep only unique IDs that still belong to published lessons in this course.
  // This prevents deleted/unpublished lessons or duplicate IDs from inflating progress.
  const validCompletedIds = [];
  const seen = new Set();

  for (const value of progress.completedVideos || []) {
    const id = String(value);
    if (!validVideoIdSet.has(id) || seen.has(id)) continue;

    seen.add(id);
    validCompletedIds.push(value);
  }

  const totalVideos = publishedVideoIds.length;
  const completedVideoCount = validCompletedIds.length;

  const overallProgress =
    totalVideos > 0
      ? Math.min(
          100,
          Math.round((completedVideoCount / totalVideos) * 100)
        )
      : 0;

  return {
    validCompletedIds,
    totalVideos,
    completedVideoCount,
    overallProgress,
  };
};

export const getCourseProgress = asyncHandler(async (req, res) => {
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

  const snapshot = await getValidProgressSnapshot(
    courseId,
    progress
  );

  progress.completedVideos = snapshot.validCompletedIds;
  progress.overallProgress = snapshot.overallProgress;
  progress.isCompleted =
    snapshot.totalVideos > 0 &&
    snapshot.completedVideoCount >= snapshot.totalVideos;

  if (progress.isCompleted) {
    if (!progress.completedAt) {
      progress.completedAt = new Date();
    }
  } else {
    progress.completedAt = null;
  }

  await progress.save();

  return successResponse({
    res,
    message: "Course progress fetched successfully.",
    data: {
      courseId,
      overallProgress: snapshot.overallProgress,
      completedVideos: snapshot.validCompletedIds,
      completedVideoCount: snapshot.completedVideoCount,
      totalVideos: snapshot.totalVideos,
      lastWatchedVideo: progress.lastWatchedVideo,
      lastWatchedPosition: progress.lastWatchedPosition,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
    },
  });
});

/**
 * POST /api/v1/progress/courses/:courseId/videos/:videoId/complete
 *
 * Marks one lesson complete immediately when the user selects it.
 *
 * Important:
 * - The backend remains authoritative.
 * - The user must own an active purchase.
 * - The lesson's module must currently be unlocked.
 * - Re-clicking an already completed lesson is idempotent.
 * - No video duration/watch percentage is involved.
 */
export const completeVideoLesson = asyncHandler(async (req, res) => {
  const { courseId, videoId } = req.params;

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

  const purchase = await getActiveCoursePurchase(
    req.user.userId,
    courseId
  );

  if (!purchase) {
    return res.status(403).json({
      success: false,
      message: "Please purchase this course first.",
      code: "COURSE_NOT_PURCHASED",
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
      message: "Lesson not found.",
      code: "VIDEO_NOT_FOUND",
    });
  }

  const access = await canAccessVideo({
    userId: req.user.userId,
    courseId,
    moduleId: video.module,
    video,
  });

  if (!access.allowed) {
    const statusCode =
      access.reason === "COURSE_NOT_PURCHASED" ||
      access.reason === "MODULE_LOCKED"
        ? 403
        : 404;

    return res.status(statusCode).json({
      success: false,
      message:
        access.reason === "MODULE_LOCKED"
          ? "This module is still locked."
          : access.reason === "COURSE_NOT_PURCHASED"
            ? "Please purchase this course first."
            : "Lesson access denied.",
      code: access.reason,
    });
  }

  const progress = await getOrCreateProgress(
    req.user.userId,
    courseId
  );

  const alreadyCompleted = (progress.completedVideos || []).some(
    (id) => String(id) === String(videoId)
  );

  if (!alreadyCompleted) {
    progress.completedVideos.push(videoId);
  }

  progress.lastWatchedVideo = videoId;
  progress.lastWatchedPosition = 0;

  const snapshot = await getValidProgressSnapshot(
    courseId,
    progress
  );

  progress.completedVideos = snapshot.validCompletedIds;
  progress.overallProgress = snapshot.overallProgress;
  progress.isCompleted =
    snapshot.totalVideos > 0 &&
    snapshot.completedVideoCount >= snapshot.totalVideos;

  if (progress.isCompleted) {
    if (!progress.completedAt) {
      progress.completedAt = new Date();
    }
  } else {
    progress.completedAt = null;
  }

  await progress.save();

  return successResponse({
    res,
    message: alreadyCompleted
      ? "Lesson was already completed."
      : "Lesson completed successfully.",
    data: {
      courseId,
      videoId,
      overallProgress: snapshot.overallProgress,
      completedVideos: snapshot.validCompletedIds,
      completedVideoCount: snapshot.completedVideoCount,
      totalVideos: snapshot.totalVideos,
      lastWatchedVideo: progress.lastWatchedVideo,
      lastWatchedPosition: progress.lastWatchedPosition,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
    },
  });
});
