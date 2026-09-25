import mongoose from "mongoose";
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import { getActiveCoursePurchase, getUnlockedModuleOrders } from "./purchase.service.js";

const assertObjectId = (value, name = "id") => {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${name}.`);
    error.statusCode = 400;
    error.code = "AI_COURSE_INVALID_ID";
    throw error;
  }
};

const denied = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

/**
 * Server-side entitlement used by every course-AI operation.
 *
 * AI access is tied to the same paid purchase/expiry rules as course access.
 * Daily module unlocking is also enforced at retrieval time so a student
 * cannot use Course AI to bypass locked lesson notes.
 */
export const getCourseAIEntitlement = async (userId, courseId) => {
  assertObjectId(userId, "user id");
  assertObjectId(courseId, "course id");

  const course = await Course.findOne({
    _id: courseId,
    isPublished: true,
  }).select("_id title isPublished").lean();

  if (!course) {
    return {
      allowed: false,
      reason: "COURSE_NOT_FOUND",
      course: null,
      purchase: null,
      unlockedModuleIds: [],
      unlockedModuleOrders: [],
      publishedModuleCount: 0,
    };
  }

  const purchase = await getActiveCoursePurchase(userId, course._id);

  if (!purchase) {
    return {
      allowed: false,
      reason: "COURSE_NOT_PURCHASED",
      course,
      purchase: null,
      unlockedModuleIds: [],
      unlockedModuleOrders: [],
    };
  }

  const modules = await Module.find({
    course: course._id,
    isPublished: true,
  }).select("_id order").sort({ order: 1 }).lean();

  const unlockedModuleOrders = getUnlockedModuleOrders({
    purchase,
    course,
    modules,
  });

  const unlockedModuleIds = modules
    .filter((module) => unlockedModuleOrders.includes(module.order))
    .map((module) => module._id);

  return {
    allowed: true,
    reason: "COURSE_AI_ACCESS_GRANTED",
    course,
    purchase,
    unlockedModuleIds,
    unlockedModuleOrders,
    publishedModuleCount: modules.length,
  };
};

export const requireCourseAIEntitlement = async (userId, courseId) => {
  const entitlement = await getCourseAIEntitlement(userId, courseId);

  if (!entitlement.allowed) {
    if (entitlement.reason === "COURSE_NOT_FOUND") {
      throw denied(404, "AI_COURSE_NOT_FOUND", "Published course not found.");
    }

    throw denied(
      403,
      "AI_COURSE_ACCESS_REQUIRED",
      "An active purchase is required for course-specific AI."
    );
  }

  return entitlement;
};

export const requireConversationCourseAIEntitlement = async (userId, conversation) => {
  if (!conversation?.course) return null;
  return requireCourseAIEntitlement(userId, conversation.course);
};
