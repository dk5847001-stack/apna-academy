import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service.js";

import {
  successResponse,
} from "../utils/apiResponse.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(
  async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const data = await getUserNotifications(
      userId,
      {
        limit: req.query.limit,
      }
    );

    return successResponse({
      res,
      message:
        "Notifications loaded successfully.",
      data,
    });
  }
);

export const markAsRead = asyncHandler(
  async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const notification =
      await markNotificationAsRead({
        userId,
        notificationId:
          req.params.notificationId,
      });

    return successResponse({
      res,
      message:
        "Notification marked as read.",
      data: notification,
    });
  }
);

export const markAllAsRead = asyncHandler(
  async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const data =
      await markAllNotificationsAsRead(
        userId
      );

    return successResponse({
      res,
      message:
        "All notifications marked as read.",
      data,
    });
  }
);
