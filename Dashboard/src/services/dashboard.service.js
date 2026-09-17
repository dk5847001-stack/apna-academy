import api from "./api";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const extractData = (response) => {
  return response?.data?.data ?? null;
};

const ensureSuccess = (
  response,
  fallbackMessage
) => {
  if (!response?.data?.success) {
    throw new Error(
      response?.data?.message ||
        fallbackMessage
    );
  }

  return extractData(response);
};

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

/**
 * Get authenticated student's complete dashboard.
 *
 * GET /api/v1/dashboard
 *
 * Authentication:
 * HttpOnly cookie.
 *
 * IMPORTANT:
 * No JWT/token is read from localStorage.
 *
 * The dashboard endpoint is a relatively expensive authenticated
 * read because the backend assembles courses, progress, purchases,
 * certificates and notifications. A sleeping/cold backend can
 * legitimately need longer than a normal API request.
 *
 * We therefore retry ONLY this idempotent GET once when the browser
 * reports a timeout/network failure. We intentionally do not put
 * retry logic in the global Axios interceptor because that could
 * duplicate non-idempotent requests such as payments.
 */
export const getDashboard = async () => {
  try {
    const response = await api.get(
      "/dashboard"
    );

    return ensureSuccess(
      response,
      "Unable to load your dashboard."
    );
  } catch (error) {
    const isTimeout =
      error?.code === "ECONNABORTED" ||
      error?.code === "ETIMEDOUT" ||
      error?.message ===
        "Network Error";

    if (!isTimeout) {
      throw error;
    }

    /*
     * Give a temporarily waking backend a short recovery window.
     * This is deliberately a single retry for this GET only.
     */
    await new Promise((resolve) =>
      window.setTimeout(resolve, 1000)
    );

    const retryResponse = await api.get(
      "/dashboard"
    );

    return ensureSuccess(
      retryResponse,
      "Unable to load your dashboard."
    );
  }
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
    params.category =
      category.trim();
  }

  if (level.trim()) {
    params.level =
      level.trim();
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
    "Unable to load course."
  );
};
