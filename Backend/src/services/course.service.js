import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Video from "../models/Video.js";

const COURSE_LIST_PROJECTION = [
  "title",
  "slug",
  "shortDescription",
  "thumbnail",
  "previewSyllabusPdfUrl",
  "freeResourcesUrl",
  "category",
  "level",
  "language",
  "instructor",
  "price",
  "allAccessPrice",
  "durationDays",
  "isPublished",
  "isFeatured",
  "tags",
  "totalModules",
  "totalVideos",
  "createdAt",
  "updatedAt",
].join(" ");

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Convert course document into public course object.
 */
const formatCourse = (course) => {
  return {
    id: course._id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnail: course.thumbnail,
    previewSyllabusPdfUrl: course.previewSyllabusPdfUrl || "",
    freeResourcesUrl: course.freeResourcesUrl || "",
    category: course.category,
    level: course.level,
    language: course.language,
    instructor: course.instructor,
    price: course.price,
    allAccessPrice: course.allAccessPrice,
    durationDays: course.durationDays,
    isPublished: course.isPublished,
    isFeatured: course.isFeatured,
    tags: course.tags,
    totalModules: course.totalModules,
    totalVideos: course.totalVideos,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};

/**
 * Create URL-friendly slug.
 */
export const createUniqueSlug = async (title) => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let slug = baseSlug;
  let counter = 1;

  while (await Course.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

/**
 * Get all published courses.
 */
export const getPublishedCourses = async ({
  page = 1,
  limit = 12,
  search = "",
  category = "",
  level = "",
  featured,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    isPublished: true,
  };

  const rawSearch = String(search || "").trim().slice(0, 100);
  if (rawSearch) {
    const term = escapeRegex(rawSearch);
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { shortDescription: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
      { tags: { $regex: term, $options: "i" } },
    ];
  }

  const rawCategory = String(category || "").trim().slice(0, 100);
  if (rawCategory) {
    filter.category = {
      $regex: `^${escapeRegex(rawCategory)}$`,
      $options: "i",
    };
  }

  const rawLevel = String(level || "").trim().slice(0, 50);
  if (rawLevel) {
    filter.level = {
      $regex: `^${escapeRegex(rawLevel)}$`,
      $options: "i",
    };
  }

  if (featured === "true" || featured === true) {
    filter.isFeatured = true;
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select(COURSE_LIST_PROJECTION)
      .sort({
        isFeatured: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(currentLimit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / currentLimit);

  return {
    courses: courses.map(formatCourse),
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

/**
 * Get one published course by slug.
 */
export const getPublishedCourseBySlug = async (slug) => {
  const course = await Course.findOne({
    slug: slug.toLowerCase(),
    isPublished: true,
  }).lean();

  if (!course) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  const modules = await Module.find({
    course: course._id,
    isPublished: true,
  })
    .sort({ order: 1 })
    .lean();

  const moduleIds = modules.map((module) => module._id);

  const videos =
    moduleIds.length > 0
      ? await Video.find({
          module: {
            $in: moduleIds,
          },
          course: course._id,
          isPublished: true,
        })
          .sort({
            module: 1,
            order: 1,
          })
          .lean()
      : [];

  /**
   * Guest preview rule:
   *
   * FIRST published video of EACH module = unlocked preview.
   *
   * All other videos = locked.
   *
   * Important:
   * Locked videos do NOT expose their videoUrl.
   */
  const formattedModules = modules.map((module) => {
    const moduleVideos = videos.filter(
      (video) =>
        video.module.toString() === module._id.toString()
    );

    const formattedVideos = moduleVideos.map(
      (video, index) => {
        const isPreview = index === 0;

        return {
          id: video._id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          order: video.order,
          isPreview,
          isLocked: !isPreview,

          // SECURITY:
          // Only preview video gets video URL.
          ...(isPreview && {
            videoUrl: video.videoUrl,
            bunnyVideoId: video.bunnyVideoId,
          }),
        };
      }
    );

    return {
      id: module._id,
      title: module.title,
      description: module.description,
      order: module.order,
      totalVideos: moduleVideos.length,
      videos: formattedVideos,
    };
  });

  return {
    course: formatCourse(course),
    modules: formattedModules,
  };
};
