import {
  getStudentDashboard,
} from "../services/dashboard.service.js";

import {
  successResponse,
} from "../utils/apiResponse.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

/* =========================================================
   GET STUDENT DASHBOARD
========================================================= */

export const getDashboard = asyncHandler(
  async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const dashboard =
      await getStudentDashboard(userId);

    return successResponse({
      res,
      message:
        "Dashboard data loaded successfully.",
      data: dashboard,
    });
  }
);