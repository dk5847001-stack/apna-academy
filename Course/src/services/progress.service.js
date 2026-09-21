import api from "./api";

/* =========================================================
   GET COURSE PROGRESS
========================================================= */

export const getCourseProgress = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required.");
  }

  const response = await api.get(
    `/progress/courses/${encodeURIComponent(courseId)}`
  );

  const responseData = response?.data;

  if (!responseData?.success) {
    throw new Error(
      responseData?.message || "Unable to load course progress."
    );
  }

  return normalizeProgress(responseData.data);
};

/* =========================================================
   COMPLETE LESSON
========================================================= */

/**
 * A lesson is completed when the user selects/clicks it.
 *
 * The backend validates purchase + module access and calculates
 * the authoritative course progress from completed lessons.
 */
export const completeVideoLesson = async ({
  courseId,
  videoId,
}) => {
  if (!courseId) {
    throw new Error("Course ID is required.");
  }

  if (!videoId) {
    throw new Error("Video ID is required.");
  }

  const response = await api.post(
    `/progress/courses/${encodeURIComponent(courseId)}/videos/${encodeURIComponent(videoId)}/complete`
  );

  const responseData = response?.data;

  if (!responseData?.success) {
    throw new Error(
      responseData?.message || "Unable to complete this lesson."
    );
  }

  return normalizeProgress(responseData.data);
};

/* =========================================================
   NORMALIZE PROGRESS
========================================================= */

export const normalizeProgress = (progressData) => {
  const progress = progressData || {};

  return {
    overallProgress: Math.min(
      100,
      Math.max(0, Number(progress.overallProgress) || 0)
    ),

    completedVideos: Array.isArray(progress.completedVideos)
      ? progress.completedVideos
      : [],

    lastWatchedVideo: progress.lastWatchedVideo || null,

    lastWatchedPosition: Math.max(
      0,
      Number(progress.lastWatchedPosition) || 0
    ),

    isCompleted: Boolean(progress.isCompleted),
    completedAt: progress.completedAt || null,
  };
};

/* =========================================================
   VIDEO COMPLETION CHECK
========================================================= */

export const isVideoCompleted = (progress, videoId) => {
  if (!progress || !videoId) return false;

  return (
    Array.isArray(progress.completedVideos) &&
    progress.completedVideos.some((completedVideo) => {
      const id =
        completedVideo && typeof completedVideo === "object"
          ? completedVideo._id || completedVideo.id
          : completedVideo;

      return id != null && String(id) === String(videoId);
    })
  );
};