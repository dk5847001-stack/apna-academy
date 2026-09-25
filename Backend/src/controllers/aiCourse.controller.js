import { requireCourseAIEntitlement } from "../services/aiCourseAuthorization.service.js";

const getUserId = (req) => req.user?.userId;

export const getAICourseAccess = async (req, res, next) => {
  try {
    const entitlement = await requireCourseAIEntitlement(
      getUserId(req),
      req.params.courseId
    );

    return res.status(200).json({
      success: true,
      data: {
        allowed: true,
        course: {
          id: entitlement.course._id,
          title: entitlement.course.title,
        },
        unlockedModuleCount: entitlement.unlockedModuleIds.length,
        totalPublishedModules: entitlement.publishedModuleCount,
        unlockMode: entitlement.purchase.unlockMode,
      },
    });
  } catch (error) {
    return next(error);
  }
};
