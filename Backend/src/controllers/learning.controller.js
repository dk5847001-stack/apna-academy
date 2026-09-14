import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Video from "../models/Video.js";
import Progress from "../models/Progress.js";

import {
  getActiveCoursePurchase,
  getUnlockedModuleOrders,
  canAccessVideo,
} from "../services/purchase.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Remove private Bunny/video data from locked videos.
 * Notes are protected exactly like the video media URL.
 */
const formatVideo = (video, unlocked, completedVideos = []) => {
  const videoId = video._id.toString();

  const isCompleted = completedVideos.some(
    (id) => id.toString() === videoId
  );

  return {
    _id: video._id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration,
    order: video.order,
    isPreview: video.isPreview,
    isLocked: !unlocked,
    isCompleted,
    ...(unlocked
      ? {
          videoUrl: video.videoUrl,
          bunnyVideoId: video.bunnyVideoId,
          notesPdfUrl: video.notesPdfUrl || "",
        }
      : {}),
  };
};

/**
 * GET /api/v1/learning/courses/:courseId
 *
 * Returns the complete learning structure for
 * an authenticated user.
 */
export const getLearningCourse = asyncHandler(
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

    const modules = await Module.find({
      course: course._id,
      isPublished: true,
    })
      .sort({ order: 1 })
      .lean();

    const videos = await Video.find({
      course: course._id,
      isPublished: true,
    })
      .sort({ order: 1 })
      .lean();

    const purchase = await getActiveCoursePurchase(
      req.user.userId,
      course._id
    );

    const progress = await Progress.findOne({
      user: req.user.userId,
      course: course._id,
    }).lean();

    const unlockedModuleOrders =
      getUnlockedModuleOrders({
        purchase,
        course,
        modules,
      });

    const completedVideos =
      progress?.completedVideos || [];

    const formattedModules = modules.map((module) => {
      const moduleUnlocked =
        unlockedModuleOrders.includes(module.order);

      const moduleVideos = videos
        .filter(
          (video) =>
            video.module.toString() ===
            module._id.toString()
        )
        .sort((a, b) => a.order - b.order);

      return {
        _id: module._id,
        title: module.title,
        description: module.description,
        order: module.order,
        totalVideos: moduleVideos.length,
        isLocked: !moduleUnlocked,
        videos: moduleVideos.map((video) =>
          formatVideo(
            video,
            moduleUnlocked || video.isPreview,
            completedVideos
          )
        ),
      };
    });

    return successResponse({
      res,
      message: "Learning course fetched successfully.",
      data: {
        course: {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          shortDescription: course.shortDescription,
          thumbnail: course.thumbnail,
          category: course.category,
          level: course.level,
          language: course.language,
          durationDays: course.durationDays,
          totalModules: course.totalModules,
          totalVideos: course.totalVideos,
        },

        access: {
          isPurchased: Boolean(purchase),
          unlockMode: purchase?.unlockMode || null,
          purchasedAt: purchase?.purchasedAt || null,
          unlockedModuleOrders,
        },

        progress: {
          overallProgress:
            progress?.overallProgress || 0,
          completedVideos:
            progress?.completedVideos || [],
          lastWatchedVideo:
            progress?.lastWatchedVideo || null,
          lastWatchedPosition:
            progress?.lastWatchedPosition || 0,
          isCompleted:
            progress?.isCompleted || false,
        },

        modules: formattedModules,
      },
    });
  }
);

/**
 * GET /api/v1/learning/courses/:courseId/videos/:videoId
 *
 * Server-side video authorization.
 *
 * This endpoint is the important security boundary.
 * Frontend cannot unlock a video just by changing
 * React state or URL parameters.
 */
export const getLearningVideo = asyncHandler(
  async (req, res) => {
    const { courseId, videoId } = req.params;

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
     * Preview videos can be watched without purchase.
     * Their optional notes PDF follows the same preview access.
     *
     * For non-preview videos, purchase + module unlock
     * is mandatory.
     */
    if (video.isPreview) {
      return successResponse({
        res,
        message: "Preview video access granted.",
        data: {
          video: {
            _id: video._id,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            order: video.order,
            isPreview: true,
            isLocked: false,
            videoUrl: video.videoUrl,
            bunnyVideoId: video.bunnyVideoId,
            notesPdfUrl: video.notesPdfUrl || "",
          },
        },
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
        access.reason === "COURSE_NOT_PURCHASED"
          ? 403
          : access.reason === "MODULE_LOCKED"
            ? 403
            : 404;

      return res.status(statusCode).json({
        success: false,
        message:
          access.reason === "COURSE_NOT_PURCHASED"
            ? "Please purchase this course first."
            : access.reason === "MODULE_LOCKED"
              ? "This module is still locked."
              : "Video access denied.",
        code: access.reason,
      });
    }

    const progress = await Progress.findOne({
      user: req.user.userId,
      course: courseId,
    }).lean();

    const completedVideos =
      progress?.completedVideos || [];

    return successResponse({
      res,
      message: "Video access granted.",
      data: {
        video: formatVideo(
          video,
          true,
          completedVideos
        ),
        progress: {
          overallProgress:
            progress?.overallProgress || 0,
          lastWatchedPosition:
            progress?.lastWatchedPosition || 0,
        },
      },
    });
  }
);