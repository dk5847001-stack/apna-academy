import api from "./api";

/* =========================================================
   GET COURSE BY SLUG
========================================================= */

export const getCourseBySlug = async (slug) => {
  if (!slug || typeof slug !== "string") {
    throw new Error("Course slug is required.");
  }

  const response = await api.get(
    `/courses/${encodeURIComponent(slug)}`
  );

  const responseData = response?.data;

  if (!responseData?.success) {
    throw new Error(
      responseData?.message ||
        "Unable to load course details."
    );
  }

  return responseData.data;
};

/* =========================================================
   NORMALIZE COURSE DATA
========================================================= */

export const normalizeCourse = (course) => {
  if (!course) {
    return null;
  }

  return {
    ...course,

    title: course.title || "Untitled Course",

    slug: course.slug || "",

    shortDescription:
      course.shortDescription || "",

    description:
      course.description || "",

    thumbnail:
      course.thumbnail || "",

    previewSyllabusPdfUrl:
      course.previewSyllabusPdfUrl || "",

    freeResourcesUrl:
      course.freeResourcesUrl || "",

    category:
      course.category || "General",

    level:
      course.level || "beginner",

    language:
      course.language || "English",

    price:
      Number(course.price) || 0,

    allAccessPrice:
      Number(course.allAccessPrice) || 99,

    durationDays:
      Number(course.durationDays) || 30,

    totalModules:
      Number(course.totalModules) || 0,

    totalVideos:
      Number(course.totalVideos) || 0,

    instructor: {
      name:
        course.instructor?.name || "ApnaAcademy",

      avatar:
        course.instructor?.avatar || "",
    },

    modules: Array.isArray(course.modules)
      ? course.modules
      : [],
  };
};