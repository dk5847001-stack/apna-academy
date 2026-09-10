import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Purchase from "../models/Purchase.js";

/**
 * Check whether a purchase is currently active.
 */
const isPurchaseActive = (purchase) => {
  if (!purchase) {
    return false;
  }

  if (purchase.paymentStatus !== "paid") {
    return false;
  }

  if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) {
    return false;
  }

  return true;
};

/**
 * Get the user's active purchase for a course.
 *
 * All-access purchase has priority over a normal course purchase.
 */
export const getActiveCoursePurchase = async (userId, courseId) => {
  const purchases = await Purchase.find({
    user: userId,
    course: courseId,
    paymentStatus: "paid",
  }).sort({
    unlockMode: -1,
    purchasedAt: 1,
  });

  const activePurchase = purchases.find(isPurchaseActive);

  return activePurchase || null;
};

/**
 * Calculate which module orders are currently unlocked.
 *
 * Daily mode:
 *   Purchase day = Module 1
 *   Next day     = Module 2
 *   Next day     = Module 3
 *   ...
 *
 * All-access mode:
 *   Every module is unlocked immediately.
 */
export const getUnlockedModuleOrders = ({
  purchase,
  course,
  modules,
}) => {
  if (!purchase || !course || !Array.isArray(modules)) {
    return [];
  }

  if (purchase.unlockMode === "all_access") {
    return modules.map((module) => module.order);
  }

  const purchaseDate = new Date(purchase.purchasedAt);

  /*
   * Calendar-day based unlocking.
   *
   * Example:
   * Purchase: 10 September
   *
   * 10 Sep -> Module 1
   * 11 Sep -> Module 2
   * 12 Sep -> Module 3
   */
  const now = new Date();

  const purchaseDay = new Date(
    purchaseDate.getFullYear(),
    purchaseDate.getMonth(),
    purchaseDate.getDate()
  );

  const currentDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const elapsedDays = Math.max(
    0,
    Math.floor(
      (currentDay.getTime() - purchaseDay.getTime()) /
        millisecondsPerDay
    )
  );

  const highestUnlockedOrder = elapsedDays + 1;

  return modules
    .filter(
      (module) =>
        module.order <= highestUnlockedOrder
    )
    .map((module) => module.order);
};

/**
 * Get complete course access information for a user.
 *
 * This function is intentionally backend-side.
 * Frontend lock states must never be treated as authorization.
 */
export const getCourseAccess = async (
  userId,
  courseId
) => {
  const course = await Course.findById(courseId);

  if (!course || !course.isPublished) {
    return {
      success: false,
      reason: "COURSE_NOT_FOUND",
      course: null,
      purchase: null,
      modules: [],
      unlockedModuleOrders: [],
    };
  }

  const modules = await Module.find({
    course: course._id,
    isPublished: true,
  }).sort({
    order: 1,
  });

  const purchase = await getActiveCoursePurchase(
    userId,
    course._id
  );

  if (!purchase) {
    return {
      success: true,
      reason: "NOT_PURCHASED",
      course,
      purchase: null,
      modules,
      unlockedModuleOrders: [],
    };
  }

  const unlockedModuleOrders =
    getUnlockedModuleOrders({
      purchase,
      course,
      modules,
    });

  return {
    success: true,
    reason: "PURCHASED",
    course,
    purchase,
    modules,
    unlockedModuleOrders,
  };
};

/**
 * Check whether a particular module is unlocked.
 */
export const canAccessModule = async ({
  userId,
  courseId,
  moduleId,
}) => {
  const access = await getCourseAccess(
    userId,
    courseId
  );

  if (!access.success) {
    return {
      allowed: false,
      reason: access.reason,
      access,
    };
  }

  if (!access.purchase) {
    return {
      allowed: false,
      reason: "COURSE_NOT_PURCHASED",
      access,
    };
  }

  const module = access.modules.find(
    (item) =>
      item._id.toString() === moduleId.toString()
  );

  if (!module) {
    return {
      allowed: false,
      reason: "MODULE_NOT_FOUND",
      access,
    };
  }

  const allowed =
    access.unlockedModuleOrders.includes(
      module.order
    );

  return {
    allowed,
    reason: allowed
      ? "MODULE_ACCESS_GRANTED"
      : "MODULE_LOCKED",
    access,
    module,
  };
};

/**
 * Check whether a particular video can be accessed.
 *
 * IMPORTANT:
 * This is only a helper.
 * The actual video endpoint will also verify:
 * - authentication
 * - course ownership
 * - module unlock status
 * - video belongs to requested course/module
 */
export const canAccessVideo = async ({
  userId,
  courseId,
  moduleId,
  video,
}) => {
  const moduleAccess = await canAccessModule({
    userId,
    courseId,
    moduleId,
  });

  if (!moduleAccess.allowed) {
    return {
      allowed: false,
      reason: moduleAccess.reason,
      access: moduleAccess.access,
      module: moduleAccess.module || null,
    };
  }

  if (
    !video ||
    video.module.toString() !==
      moduleAccess.module._id.toString()
  ) {
    return {
      allowed: false,
      reason: "VIDEO_NOT_FOUND",
      access: moduleAccess.access,
      module: moduleAccess.module,
    };
  }

  return {
    allowed: true,
    reason: "VIDEO_ACCESS_GRANTED",
    access: moduleAccess.access,
    module: moduleAccess.module,
    video,
  };
};