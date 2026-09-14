import mongoose from "mongoose";
import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

const objectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatProgress = (item) => {
  const position = Number(item.lastWatchedPosition || 0);
  const duration = Number(item.lastWatchedVideo?.duration || 0);
  const watchPercentage = duration > 0 ? Math.min(Math.max((position / duration) * 100, 0), 100) : 0;
  const totalVideos = Number(item.course?.totalVideos || 0);
  const completedVideoCount = Array.isArray(item.completedVideos) ? item.completedVideos.length : 0;

  return {
    id: item._id?.toString(),
    overallProgress: Number(item.overallProgress || 0),
    isCompleted: Boolean(item.isCompleted),
    completedAt: item.completedAt || null,
    lastActivityAt: item.updatedAt || item.createdAt || null,
    lastWatchedPosition: position,
    completedVideoCount,
    totalVideos,
    videoCompletionPercent: totalVideos > 0 ? Math.min((completedVideoCount / totalVideos) * 100, 100) : 0,
    lastWatchedVideo: item.lastWatchedVideo ? {
      id: item.lastWatchedVideo._id?.toString(),
      title: item.lastWatchedVideo.title,
      duration,
      watchPercentage,
    } : null,
    user: item.user ? {
      id: item.user._id?.toString(),
      name: item.user.name,
      email: item.user.email,
      avatar: item.user.avatar || "",
    } : null,
    course: item.course ? {
      id: item.course._id?.toString(),
      title: item.course.title,
      slug: item.course.slug,
      thumbnail: item.course.thumbnail || "",
      totalVideos,
      totalModules: Number(item.course.totalModules || 0),
    } : null,
  };
};

export const listAdminProgress = async ({ page = 1, limit = 20, search = "", courseId = "", completed = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (objectId(courseId)) query.course = courseId;
  if (completed === "true") query.isCompleted = true;
  if (completed === "false") query.isCompleted = false;

  if (search?.trim()) {
    const regex = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const [userIds, courseIds] = await Promise.all([
      User.find({ $or: [{ name: { $regex: regex, $options: "i" } }, { email: { $regex: regex, $options: "i" } }] }).distinct("_id"),
      Course.find({ title: { $regex: regex, $options: "i" } }).distinct("_id"),
    ]);
    query.$or = [{ user: { $in: userIds } }, { course: { $in: courseIds } }];
  }

  const skip = (safePage - 1) * safeLimit;
  const [rows, total] = await Promise.all([
    Progress.find(query)
      .populate({ path: "user", select: "name email avatar" })
      .populate({ path: "course", select: "title slug thumbnail totalVideos totalModules" })
      .populate({ path: "lastWatchedVideo", select: "title duration" })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Progress.countDocuments(query),
  ]);

  return {
    progress: rows.map(formatProgress),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getAdminProgress = async (progressId) => {
  if (!objectId(progressId)) {
    const e = new Error("Invalid progress id.");
    e.statusCode = 400;
    throw e;
  }

  const row = await Progress.findById(progressId)
    .populate({ path: "user", select: "name email avatar role status isEmailVerified" })
    .populate({ path: "course", select: "title slug thumbnail totalVideos totalModules" })
    .populate({ path: "lastWatchedVideo", select: "title duration" })
    .lean();

  if (!row) {
    const e = new Error("Progress record not found.");
    e.statusCode = 404;
    throw e;
  }

  return formatProgress(row);
};
