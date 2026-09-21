import api from "./api";

/* =========================================================
   GET LEARNING COURSE
   Returns:
   - course
   - access
   - progress
   - modules
   - videos
========================================================= */

export const getLearningCourse = async (
  courseId
) => {
  if (!courseId) {
    throw new Error(
      "Course ID is required."
    );
  }

  const response = await api.get(
    `/learning/courses/${encodeURIComponent(
      courseId
    )}`
  );

  const responseData = response?.data;

  if (!responseData?.success) {
    throw new Error(
      responseData?.message ||
        "Unable to load learning course."
    );
  }

  return responseData.data;
};

/* =========================================================
   GET SINGLE LEARNING VIDEO

   Backend performs the actual authorization.

   Important:
   Frontend must NEVER assume that a video is
   accessible just because its URL is present.
========================================================= */

export const getLearningVideo = async ({
  courseId,
  videoId,
}) => {
  if (!courseId) {
    throw new Error(
      "Course ID is required."
    );
  }

  if (!videoId) {
    throw new Error(
      "Video ID is required."
    );
  }

  const response = await api.get(
    `/learning/courses/${encodeURIComponent(
      courseId
    )}/videos/${encodeURIComponent(
      videoId
    )}`
  );

  const responseData = response?.data;

  if (!responseData?.success) {
    throw new Error(
      responseData?.message ||
        "Unable to load video."
    );
  }

  return responseData.data;
};

/* =========================================================
   NORMALIZE LEARNING COURSE
========================================================= */

export const normalizeLearningCourse = (
  learningData
) => {
  if (!learningData) {
    return null;
  }

  return {
    course: learningData.course || null,

    access: {
      isPurchased:
        Boolean(
          learningData.access
            ?.isPurchased
        ),

      unlockMode:
        learningData.access
          ?.unlockMode || null,

      purchasedAt:
        learningData.access
          ?.purchasedAt || null,

      unlockedModuleOrders:
        Array.isArray(
          learningData.access
            ?.unlockedModuleOrders
        )
          ? learningData.access
              .unlockedModuleOrders
          : [],
    },

    progress: {
      overallProgress:
        Number(
          learningData.progress
            ?.overallProgress
        ) || 0,

      completedVideoCount:
        Number(
          learningData.progress
            ?.completedVideoCount
        ) || 0,

      totalVideos:
        Number(
          learningData.progress
            ?.totalVideos
        ) || 0,

      completedVideos:
        Array.isArray(
          learningData.progress
            ?.completedVideos
        )
          ? learningData.progress
              .completedVideos
          : [],

      lastWatchedVideo:
        learningData.progress
          ?.lastWatchedVideo || null,

      lastWatchedPosition:
        Number(
          learningData.progress
            ?.lastWatchedPosition
        ) || 0,

      isCompleted:
        Boolean(
          learningData.progress
            ?.isCompleted
        ),
    },

    modules: Array.isArray(
      learningData.modules
    )
      ? learningData.modules
      : [],
  };
};

/* =========================================================
   NORMALIZE VIDEO
========================================================= */

export const normalizeLearningVideo = (
  videoData
) => {
  const video = videoData?.video;

  if (!video) {
    return null;
  }

  return {
    ...video,

    isLocked:
      Boolean(video.isLocked),

    isCompleted:
      Boolean(video.isCompleted),

    isPreview:
      Boolean(video.isPreview),

    videoSource:
      video.videoSource === "drive"
        ? "drive"
        : "bunny",

    duration:
      Number(video.duration) || 0,

    videoUrl:
      video.videoUrl || "",

    bunnyVideoId:
      video.bunnyVideoId || "",
  };
};