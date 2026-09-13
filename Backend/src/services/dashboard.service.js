import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/* =========================================================
   HELPERS
========================================================= */

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

  if (
    purchase.expiresAt &&
    new Date(purchase.expiresAt) < new Date()
  ) {
    return false;
  }

  return true;
};

/**
 * Convert MongoDB/ObjectId values safely to strings.
 */
const toId = (value) => {
  if (!value) {
    return null;
  }

  return String(value);
};

/**
 * Keep only safe user fields for the dashboard.
 */
const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
};

/**
 * Convert course document into a small dashboard-friendly object.
 */
const serializeCourse = (course) => {
  if (!course) {
    return null;
  }

  return {
    id: course._id,
    title: course.title,
    slug: course.slug,
    shortDescription:
      course.shortDescription || "",
    thumbnail: course.thumbnail || "",
    category: course.category,
    level: course.level,
    language: course.language,
    instructor: course.instructor || {
      name: "",
      avatar: "",
    },
    price: course.price,
    allAccessPrice: course.allAccessPrice,
    durationDays: course.durationDays,
    totalModules: course.totalModules,
    totalVideos: course.totalVideos,
    isFeatured: course.isFeatured,
  };
};

/* =========================================================
   MAIN DASHBOARD SERVICE
========================================================= */

/**
 * Get all important student dashboard data.
 *
 * This is intentionally user-scoped.
 *
 * IMPORTANT:
 * Every database query uses req.user.userId
 * from the authenticated backend session/token.
 */
export const getStudentDashboard = async (
  userId
) => {
  if (!userId) {
    const error = new Error(
      "Authenticated user is required."
    );

    error.statusCode = 401;

    throw error;
  }

  /*
   * -------------------------------------------------------
   * USER
   * -------------------------------------------------------
   */

  const user = await User.findById(userId)
    .select(
      "_id name email role avatar phone isEmailVerified status createdAt lastLoginAt"
    )
    .lean();

  if (!user) {
    const error = new Error(
      "User not found."
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * -------------------------------------------------------
   * PAID PURCHASES
   * -------------------------------------------------------
   *
   * Only paid + currently active purchases are treated
   * as enrolled courses.
   */

  const purchases = await Purchase.find({
    user: userId,
    paymentStatus: "paid",
  })
    .populate({
      path: "course",
      select:
        "_id title slug shortDescription thumbnail category level language instructor price allAccessPrice durationDays totalModules totalVideos isFeatured isPublished",
    })
    .sort({
      purchasedAt: -1,
    })
    .lean();

  const activePurchases = purchases.filter(
    isPurchaseActive
  );

  /*
   * -------------------------------------------------------
   * UNIQUE ENROLLED COURSES
   * -------------------------------------------------------
   *
   * A user may have multiple purchases for the same
   * course (normal purchase + all-access).
   *
   * Dashboard should show the course only once.
   */

  const enrolledCourseMap = new Map();

  for (const purchase of activePurchases) {
    const course = purchase.course;

    if (!course) {
      continue;
    }

    if (!course.isPublished) {
      continue;
    }

    const courseId = toId(course._id);

    if (!courseId) {
      continue;
    }

    if (!enrolledCourseMap.has(courseId)) {
      enrolledCourseMap.set(courseId, {
        course,
        purchase,
      });
      continue;
    }

    /*
     * Prefer all-access purchase if the user has one.
     */
    const existing =
      enrolledCourseMap.get(courseId);

    if (
      purchase.unlockMode === "all_access" &&
      existing.purchase.unlockMode !==
        "all_access"
    ) {
      enrolledCourseMap.set(courseId, {
        course,
        purchase,
      });
    }
  }

  const enrolledCourseEntries = Array.from(
    enrolledCourseMap.values()
  );

  const enrolledCourseIds =
    enrolledCourseEntries.map(
      (item) => item.course._id
    );

  /*
   * -------------------------------------------------------
   * PROGRESS
   * -------------------------------------------------------
   */

  const progressDocuments =
    enrolledCourseIds.length > 0
      ? await Progress.find({
          user: userId,
          course: {
            $in: enrolledCourseIds,
          },
        })
          .populate({
            path: "lastWatchedVideo",
            select:
              "_id title description duration thumbnail bunnyVideoId bunnyVideoUrl isPublished module",
          })
          .lean()
      : [];

  const progressMap = new Map();

  for (const progress of progressDocuments) {
    progressMap.set(
      toId(progress.course),
      progress
    );
  }

  /*
   * -------------------------------------------------------
   * ENROLLED COURSES + PROGRESS
   * -------------------------------------------------------
   */

  const enrolledCourses =
    enrolledCourseEntries.map(
      ({ course, purchase }) => {
        const courseId = toId(course._id);

        const progress =
          progressMap.get(courseId);

        const overallProgress = Math.min(
          100,
          Math.max(
            0,
            Number(
              progress?.overallProgress || 0
            )
          )
        );

        return {
          ...serializeCourse(course),

          progress: overallProgress,

          completedVideos:
            progress?.completedVideos
              ?.length || 0,

          totalVideos:
            course.totalVideos || 0,

          isCompleted:
            Boolean(progress?.isCompleted),

          completedAt:
            progress?.completedAt || null,

          lastWatchedVideo:
            progress?.lastWatchedVideo || null,

          lastWatchedPosition:
            Number(
              progress?.lastWatchedPosition || 0
            ),

          purchase: {
            id: purchase._id,
            purchaseType:
              purchase.purchaseType,
            unlockMode:
              purchase.unlockMode,
            paymentStatus:
              purchase.paymentStatus,
            purchasedAt:
              purchase.purchasedAt,
            expiresAt:
              purchase.expiresAt,
          },
        };
      }
    );

  /*
   * -------------------------------------------------------
   * CONTINUE LEARNING
   * -------------------------------------------------------
   *
   * Find the most recently updated incomplete course.
   */

  const continueLearningCandidates =
    enrolledCourses
      .filter(
        (course) =>
          course.progress > 0 &&
          !course.isCompleted &&
          course.lastWatchedVideo
      )
      .sort((a, b) => {
        const aDate =
          progressMap.get(
            toId(a.id)
          )?.updatedAt || 0;

        const bDate =
          progressMap.get(
            toId(b.id)
          )?.updatedAt || 0;

        return (
          new Date(bDate) -
          new Date(aDate)
        );
      });

  const continueLearning =
    continueLearningCandidates.length > 0
      ? {
          course:
            continueLearningCandidates[0],
          video:
            continueLearningCandidates[0]
              .lastWatchedVideo,
          position:
            continueLearningCandidates[0]
              .lastWatchedPosition,
        }
      : null;

  /*
   * -------------------------------------------------------
   * RECENT PURCHASES
   * -------------------------------------------------------
   */

  const recentPurchases =
    activePurchases
      .filter((purchase) => purchase.course)
      .slice(0, 5)
      .map((purchase) => ({
        id: purchase._id,

        course: serializeCourse(
          purchase.course
        ),

        amount: purchase.amount,

        currency: purchase.currency,

        purchaseType:
          purchase.purchaseType,

        unlockMode:
          purchase.unlockMode,

        paymentStatus:
          purchase.paymentStatus,

        purchasedAt:
          purchase.purchasedAt,

        expiresAt:
          purchase.expiresAt,

        razorpayOrderId:
          purchase.razorpayOrderId,

        razorpayPaymentId:
          purchase.razorpayPaymentId,
      }));

  /*
   * -------------------------------------------------------
   * CERTIFICATES
   * -------------------------------------------------------
   */

  const certificates =
    await Certificate.find({
      user: userId,
    })
      .populate({
        path: "course",
        select:
          "_id title slug thumbnail category",
      })
      .sort({
        issueDate: -1,
      })
      .lean();

  const serializedCertificates =
    certificates.map((certificate) => ({
      id: certificate._id,

      certificateId:
        certificate.certificateId,

      recipientName:
        certificate.recipientName,

      issueDate:
        certificate.issueDate,

      certificateUrl:
        certificate.certificateUrl,

      verificationUrl:
        certificate.verificationUrl,

      qrCodeUrl:
        certificate.qrCodeUrl,

      isValid:
        certificate.isValid,

      course: certificate.course
        ? {
            id: certificate.course._id,
            title:
              certificate.course.title,
            slug:
              certificate.course.slug,
            thumbnail:
              certificate.course.thumbnail,
            category:
              certificate.course.category,
          }
        : null,
    }));

  /*
   * -------------------------------------------------------
   * NOTIFICATIONS
   * -------------------------------------------------------
   *
   * Notification.user === null means global notification.
   *
   * Therefore user receives:
   * 1. Personal notifications
   * 2. Global notifications
   */

  const notifications =
    await Notification.find({
      $or: [
        {
          user: userId,
        },
        {
          user: null,
        },
      ],
    })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .lean();

  const serializedNotifications =
    notifications.map(
      (notification) => ({
        id: notification._id,

        title:
          notification.title,

        message:
          notification.message,

        type:
          notification.type,

        link:
          notification.link || "",

        isRead:
          notification.isRead,

        createdAt:
          notification.createdAt,

        updatedAt:
          notification.updatedAt,
      })
    );

  /*
   * -------------------------------------------------------
   * DASHBOARD STATS
   * -------------------------------------------------------
   */

  const enrolledCourseCount =
    enrolledCourses.length;

  const completedCourseCount =
    enrolledCourses.filter(
      (course) =>
        course.isCompleted
    ).length;

  const averageProgress =
    enrolledCourseCount > 0
      ? Math.round(
          enrolledCourses.reduce(
            (total, course) =>
              total +
              Number(
                course.progress || 0
              ),
            0
          ) /
            enrolledCourseCount
        )
      : 0;

  const unreadNotificationCount =
    serializedNotifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  const stats = {
    enrolledCourses:
      enrolledCourseCount,

    completedCourses:
      completedCourseCount,

    certificates:
      serializedCertificates.length,

    purchases:
      activePurchases.length,

    overallProgress:
      Math.min(
        100,
        Math.max(
          0,
          averageProgress
        )
      ),

    unreadNotifications:
      unreadNotificationCount,
  };

  /*
   * -------------------------------------------------------
   * FINAL RESPONSE
   * -------------------------------------------------------
   */

  return {
    user: sanitizeUser(user),

    stats,

    continueLearning,

    enrolledCourses,

    recentPurchases,

    certificates:
      serializedCertificates,

    notifications:
      serializedNotifications,
  };
};

/* =========================================================
   EXPORT
========================================================= */

const dashboardService = {
  getStudentDashboard,
};

export default dashboardService;