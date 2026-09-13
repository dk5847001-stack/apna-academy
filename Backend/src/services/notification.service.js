import Notification from "../models/Notification.js";

const normalizeNotification = (notification) => ({
  _id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  link: notification.link || "",
  isRead: Boolean(notification.isRead),
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export const getUserNotifications = async (
  userId,
  { limit = 50 } = {}
) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  const notifications = await Notification.find({
    $or: [
      { user: userId },
      { user: null },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return {
    notifications: notifications.map(
      normalizeNotification
    ),
    unreadCount,
  };
};

export const markNotificationAsRead = async ({
  userId,
  notificationId,
}) => {
  const notification =
    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        $or: [
          { user: userId },
          { user: null },
        ],
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      }
    ).lean();

  if (!notification) {
    const error = new Error(
      "Notification not found."
    );
    error.statusCode = 404;
    throw error;
  }

  return normalizeNotification(notification);
};

export const markAllNotificationsAsRead = async (
  userId
) => {
  const result = await Notification.updateMany(
    {
      $or: [
        { user: userId },
        { user: null },
      ],
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return {
    updatedCount: result.modifiedCount || 0,
  };
};
