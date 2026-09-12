import api from "./api";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

/**
 * Backend uses:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: ...
 * }
 *
 * Keep response handling centralized so pages do not
 * repeatedly depend on the Axios response structure.
 */
const extractData = (response) => {
  return response?.data?.data ?? null;
};

const ensureSuccess = (response, fallbackMessage) => {
  if (!response?.data?.success) {
    throw new Error(
      response?.data?.message ||
        fallbackMessage
    );
  }

  return extractData(response);
};

/* =========================================================
   COURSE CATALOG
========================================================= */

/**
 * Get published courses.
 *
 * GET /api/v1/courses
 *
 * Public endpoint.
 */
export const getCourses = async ({
  page = 1,
  limit = 12,
  search = "",
  category = "",
  level = "",
  featured,
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (search.trim()) {
    params.search = search.trim();
  }

  if (category.trim()) {
    params.category = category.trim();
  }

  if (level.trim()) {
    params.level = level.trim();
  }

  if (featured !== undefined) {
    params.featured = featured;
  }

  const response = await api.get(
    "/courses",
    {
      params,
    }
  );

  return ensureSuccess(
    response,
    "Unable to load courses."
  );
};

/**
 * Get a published course by slug.
 *
 * GET /api/v1/courses/:slug
 *
 * Public endpoint.
 */
export const getCourseBySlug = async (
  slug
) => {
  if (!slug) {
    throw new Error(
      "Course slug is required."
    );
  }

  const response = await api.get(
    `/courses/${encodeURIComponent(slug)}`
  );

  return ensureSuccess(
    response,
    "Unable to load course details."
  );
};

/* =========================================================
   AUTHENTICATED LEARNING
========================================================= */

/**
 * Get the authenticated user's learning structure
 * for a specific course.
 *
 * GET /api/v1/learning/courses/:courseId
 *
 * Backend returns:
 *
 * data: {
 *   course,
 *   access,
 *   progress,
 *   modules
 * }
 */
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

  return ensureSuccess(
    response,
    "Unable to load your course."
  );
};

/**
 * Get an individual authorized learning video.
 *
 * GET /api/v1/learning/courses/:courseId/videos/:videoId
 *
 * Authorization is enforced by the backend.
 */
export const getLearningVideo = async ({
  courseId,
  videoId,
}) => {
  if (!courseId || !videoId) {
    throw new Error(
      "Course ID and video ID are required."
    );
  }

  const response = await api.get(
    `/learning/courses/${encodeURIComponent(
      courseId
    )}/videos/${encodeURIComponent(videoId)}`
  );

  return ensureSuccess(
    response,
    "Unable to load the learning video."
  );
};

/* =========================================================
   COURSE PROGRESS
========================================================= */

/**
 * Get current user's progress for a course.
 *
 * GET /api/v1/progress/courses/:courseId
 */
export const getCourseProgress = async (
  courseId
) => {
  if (!courseId) {
    throw new Error(
      "Course ID is required."
    );
  }

  const response = await api.get(
    `/progress/courses/${encodeURIComponent(
      courseId
    )}`
  );

  return ensureSuccess(
    response,
    "Unable to load course progress."
  );
};

/**
 * Save video watch position / completion.
 *
 * POST /api/v1/progress/courses/:courseId/videos/:videoId
 */
export const updateVideoProgress = async ({
  courseId,
  videoId,
  position = 0,
  completed = false,
}) => {
  if (!courseId || !videoId) {
    throw new Error(
      "Course ID and video ID are required."
    );
  }

  const response = await api.post(
    `/progress/courses/${encodeURIComponent(
      courseId
    )}/videos/${encodeURIComponent(videoId)}`,
    {
      position,
      completed,
    }
  );

  return ensureSuccess(
    response,
    "Unable to save learning progress."
  );
};

/* =========================================================
   DASHBOARD DATA NORMALIZERS
========================================================= */

/**
 * Normalize learning data for dashboard components.
 *
 * This does not invent backend fields.
 * It only maps fields already returned by the API.
 */
export const normalizeLearningData = (
  learningData
) => {
  if (!learningData) {
    return {
      course: null,
      access: null,
      progress: null,
      modules: [],
    };
  }

  return {
    course: learningData.course || null,

    access: learningData.access || null,

    progress: {
      overallProgress:
        Number(
          learningData.progress
            ?.overallProgress
        ) || 0,

      completedVideos:
        learningData.progress
          ?.completedVideos || [],

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

    modules:
      learningData.modules || [],
  };
};

/* =========================================================
   CONTINUE LEARNING
========================================================= */

/**
 * Convert authenticated learning data into the small
 * structure required by the Dashboard "Continue Learning"
 * component.
 *
 * Returns null when there is no last watched video.
 */
export const getContinueLearningData = (
  learningData
) => {
  const normalized =
    normalizeLearningData(
      learningData
    );

  const {
    course,
    progress,
  } = normalized;

  if (
    !course ||
    !progress?.lastWatchedVideo
  ) {
    return null;
  }

  let lastVideo = null;
  let lastModule = null;

  for (const module of normalized.modules) {
    const video = (
      module.videos || []
    ).find(
      (item) =>
        String(
          item._id || item.id
        ) ===
        String(
          progress.lastWatchedVideo
        )
    );

    if (video) {
      lastVideo = video;
      lastModule = module;
      break;
    }
  }

  return {
    course,
    progress:
      progress.overallProgress,

    lastWatchedVideo:
      progress.lastWatchedVideo,

    lastWatchedPosition:
      progress.lastWatchedPosition,

    video: lastVideo,

    module: lastModule,

    isCompleted:
      progress.isCompleted,
  };
};

/* =========================================================
   DASHBOARD SERVICE OBJECT
========================================================= */

const dashboardService = {
  getCourses,
  getCourseBySlug,

  getLearningCourse,
  getLearningVideo,

  getCourseProgress,
  updateVideoProgress,

  normalizeLearningData,
  getContinueLearningData,
};

export default dashboardService;