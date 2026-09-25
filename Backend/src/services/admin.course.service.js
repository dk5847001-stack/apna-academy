import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Video from "../models/Video.js";
import AIKnowledgeChunk from "../models/AIKnowledgeChunk.js";

const ADMIN_COURSE_LIST_PROJECTION = [
  "title",
  "slug",
  "shortDescription",
  "thumbnail",
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

const ensureObjectId = (value, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${label}.`);
    error.statusCode = 400;
    throw error;
  }
  return value;
};

const makeSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uniqueSlug = async (title, excludeId = null) => {
  const base = makeSlug(title);
  if (!base) {
    const error = new Error("Course title must produce a valid slug.");
    error.statusCode = 400;
    throw error;
  }

  let slug = base;
  let counter = 1;
  while (
    await Course.exists({
      slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    })
  ) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

const recalculateModuleTotal = async (moduleId) => {
  const totalVideos = await Video.countDocuments({ module: moduleId });
  await Module.findByIdAndUpdate(moduleId, { totalVideos });
};

const recalculateCourseTotals = async (courseId) => {
  const [totalModules, totalVideos] = await Promise.all([
    Module.countDocuments({ course: courseId }),
    Video.countDocuments({ course: courseId }),
  ]);
  await Course.findByIdAndUpdate(courseId, { totalModules, totalVideos });
};

const formatVideo = (video) => ({
  id: video._id,
  course: video.course,
  module: video.module,
  title: video.title,
  description: video.description,
  videoSource: video.videoSource || "bunny",
  videoUrl: video.videoUrl,
  bunnyVideoId: video.bunnyVideoId,
  thumbnailUrl: video.thumbnailUrl,
  notesPdfUrl: video.notesPdfUrl || "",
  duration: video.duration,
  order: video.order,
  isPreview: video.isPreview,
  isPublished: video.isPublished,
  createdAt: video.createdAt,
  updatedAt: video.updatedAt,
});

const formatModule = (module, videos = []) => ({
  id: module._id,
  course: module.course,
  title: module.title,
  description: module.description,
  order: module.order,
  isPublished: module.isPublished,
  totalVideos: module.totalVideos,
  videos: videos.map(formatVideo),
  createdAt: module.createdAt,
  updatedAt: module.updatedAt,
});

const formatCourse = (course, modules = []) => ({
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
  modules,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});

export const listAdminCourses = async ({ page = 1, limit = 20, search = "" }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (currentPage - 1) * currentLimit;
  const filter = {};

  const rawSearch = String(search || "").trim().slice(0, 100);
  if (rawSearch) {
    const term = escapeRegex(rawSearch);
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { slug: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select(ADMIN_COURSE_LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / currentLimit);

  return {
    courses: courses.map((course) => formatCourse(course)),
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

export const getAdminCourse = async (courseId) => {
  ensureObjectId(courseId, "course id");

  /*
   * These reads are independent. Running them together removes one full
   * database round-trip from every course-detail request.
   */
  const [course, modules] = await Promise.all([
    Course.findById(courseId).lean(),
    Module.find({ course: courseId }).sort({ order: 1 }).lean(),
  ]);

  if (!course) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  const moduleIds = modules.map((module) => module._id);
  const videos = moduleIds.length
    ? await Video.find({
        course: course._id,
        module: { $in: moduleIds },
      })
        .sort({ module: 1, order: 1 })
        .lean()
    : [];

  /* Avoid repeatedly scanning the full video array for every module. */
  const videosByModule = new Map();
  for (const video of videos) {
    const key = String(video.module);
    const bucket = videosByModule.get(key);
    if (bucket) {
      bucket.push(video);
    } else {
      videosByModule.set(key, [video]);
    }
  }

  return formatCourse(
    course,
    modules.map((module) =>
      formatModule(module, videosByModule.get(String(module._id)) || [])
    )
  );
};

export const createAdminCourse = async (payload = {}) => {
  const title = String(payload.title || "").trim();
  const category = String(payload.category || "").trim();
  if (!title || !category) {
    const error = new Error("Course title and category are required.");
    error.statusCode = 400;
    throw error;
  }

  const course = await Course.create({
    title,
    slug: await uniqueSlug(title),
    shortDescription: payload.shortDescription || "",
    description: payload.description || "",
    thumbnail: payload.thumbnail || "",
    previewSyllabusPdfUrl: String(payload.previewSyllabusPdfUrl || "").trim(),
    freeResourcesUrl: String(payload.freeResourcesUrl || "").trim(),
    category,
    level: payload.level || "beginner",
    language: payload.language || "English",
    instructor: payload.instructor || { name: "", avatar: "" },
    price: Number(payload.price) || 0,
    allAccessPrice: Number(payload.allAccessPrice ?? 99),
    durationDays: Math.max(Number(payload.durationDays) || 30, 1),
    isPublished: Boolean(payload.isPublished),
    isFeatured: Boolean(payload.isFeatured),
    tags: Array.isArray(payload.tags) ? payload.tags : [],
  });

  return getAdminCourse(course._id);
};

export const updateAdminCourse = async (courseId, payload = {}) => {
  ensureObjectId(courseId, "course id");
  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  const allowed = [
    "shortDescription",
    "description",
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
  ];

  for (const key of allowed) {
    if (payload[key] !== undefined) course[key] = payload[key];
  }

  if (payload.title !== undefined) {
    const title = String(payload.title).trim();
    if (!title) {
      const error = new Error("Course title cannot be empty.");
      error.statusCode = 400;
      throw error;
    }

    const previousTitle = String(course.title || "").trim();
    course.title = title;
    if (title.toLowerCase() !== previousTitle.toLowerCase()) {
      course.slug = await uniqueSlug(title, course._id);
    }
  }

  course.price = Math.max(Number(course.price) || 0, 0);
  course.allAccessPrice = Math.max(Number(course.allAccessPrice) || 0, 0);
  course.durationDays = Math.max(Number(course.durationDays) || 1, 1);
  await course.save();
  await AIKnowledgeChunk.deleteMany({ course: course._id });
  return getAdminCourse(course._id);
};

export const deleteAdminCourse = async (courseId) => {
  ensureObjectId(courseId, "course id");
  const course = await Course.findById(courseId).lean();
  if (!course) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  await Promise.all([
    Video.deleteMany({ course: courseId }),
    Module.deleteMany({ course: courseId }),
    Course.deleteOne({ _id: courseId }),
    AIKnowledgeChunk.deleteMany({ course: courseId }),
  ]);

  return { id: courseId };
};

export const createAdminModule = async (courseId, payload = {}) => {
  ensureObjectId(courseId, "course id");
  if (!(await Course.exists({ _id: courseId }))) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  const title = String(payload.title || "").trim();
  if (!title) {
    const error = new Error("Module title is required.");
    error.statusCode = 400;
    throw error;
  }

  const order = Number(payload.order) || ((await Module.countDocuments({ course: courseId })) + 1);
  const module = await Module.create({
    course: courseId,
    title,
    description: payload.description || "",
    order: Math.max(order, 1),
    isPublished: payload.isPublished !== undefined ? Boolean(payload.isPublished) : true,
    totalVideos: 0,
  });

  await recalculateCourseTotals(courseId);
  return getAdminCourse(courseId).then((course) => course.modules.find((item) => String(item.id) === String(module._id)));
};

export const updateAdminModule = async (moduleId, payload = {}) => {
  ensureObjectId(moduleId, "module id");
  const module = await Module.findById(moduleId);
  if (!module) {
    const error = new Error("Module not found.");
    error.statusCode = 404;
    throw error;
  }

  if (payload.title !== undefined) module.title = String(payload.title).trim();
  if (payload.description !== undefined) module.description = payload.description;
  if (payload.order !== undefined) module.order = Math.max(Number(payload.order) || 1, 1);
  if (payload.isPublished !== undefined) module.isPublished = Boolean(payload.isPublished);
  await module.save();
  await AIKnowledgeChunk.deleteMany({ course: module.course, module: module._id });
  await recalculateCourseTotals(module.course);
  return getAdminCourse(module.course);
};

export const deleteAdminModule = async (moduleId) => {
  ensureObjectId(moduleId, "module id");
  const module = await Module.findById(moduleId).lean();
  if (!module) {
    const error = new Error("Module not found.");
    error.statusCode = 404;
    throw error;
  }

  await Promise.all([
    Video.deleteMany({ module: moduleId }),
    Module.deleteOne({ _id: moduleId }),
    AIKnowledgeChunk.deleteMany({ course: module.course, module: moduleId }),
  ]);
  await recalculateCourseTotals(module.course);
  return { courseId: module.course, id: moduleId };
};

export const createAdminVideo = async (moduleId, payload = {}) => {
  ensureObjectId(moduleId, "module id");
  const module = await Module.findById(moduleId).lean();
  if (!module) {
    const error = new Error("Module not found.");
    error.statusCode = 404;
    throw error;
  }

  const title = String(payload.title || "").trim();
  if (!title) {
    const error = new Error("Video title is required.");
    error.statusCode = 400;
    throw error;
  }

  const video = await Video.create({
    course: module.course,
    module: module._id,
    title,
    description: payload.description || "",
    videoSource: payload.videoSource || "bunny",
    videoUrl: payload.videoUrl || "",
    bunnyVideoId: payload.bunnyVideoId || "",
    thumbnailUrl: payload.thumbnailUrl || "",
    notesPdfUrl: payload.notesPdfUrl || "",
    duration: Math.max(Number(payload.duration) || 0, 0),
    order: Math.max(Number(payload.order) || ((await Video.countDocuments({ module: moduleId })) + 1), 1),
    isPreview: Boolean(payload.isPreview),
    isPublished: payload.isPublished !== undefined ? Boolean(payload.isPublished) : true,
  });

  await Promise.all([recalculateModuleTotal(moduleId), recalculateCourseTotals(module.course)]);
  return formatVideo(video.toObject());
};

export const updateAdminVideo = async (videoId, payload = {}) => {
  ensureObjectId(videoId, "video id");
  const video = await Video.findById(videoId);
  if (!video) {
    const error = new Error("Video not found.");
    error.statusCode = 404;
    throw error;
  }

  const allowed = [
    "title",
    "description",
    "videoSource",
    "videoUrl",
    "bunnyVideoId",
    "thumbnailUrl",
    "notesPdfUrl",
    "duration",
    "order",
    "isPreview",
    "isPublished",
  ];

  for (const key of allowed) {
    if (payload[key] !== undefined) video[key] = payload[key];
  }

  if (!["bunny", "drive"].includes(video.videoSource)) {
    video.videoSource = "bunny";
  }

  video.title = String(video.title || "").trim();
  video.duration = Math.max(Number(video.duration) || 0, 0);
  video.order = Math.max(Number(video.order) || 1, 1);
  video.notesPdfUrl = String(video.notesPdfUrl || "").trim();
  await video.save();
  await AIKnowledgeChunk.deleteMany({ course: video.course, video: video._id });

  await Promise.all([recalculateModuleTotal(video.module), recalculateCourseTotals(video.course)]);
  return getAdminCourse(video.course);
};

export const deleteAdminVideo = async (videoId) => {
  ensureObjectId(videoId, "video id");
  const video = await Video.findById(videoId).lean();
  if (!video) {
    const error = new Error("Video not found.");
    error.statusCode = 404;
    throw error;
  }

  await Video.deleteOne({ _id: videoId });
  await AIKnowledgeChunk.deleteMany({ course: video.course, video: videoId });
  await Promise.all([recalculateModuleTotal(video.module), recalculateCourseTotals(video.course)]);
  return { courseId: video.course, moduleId: video.module, id: videoId };
};
