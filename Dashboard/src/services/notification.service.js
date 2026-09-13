import api from "./api";

const extractData = (response) =>
  response?.data?.data ?? null;

const ensureSuccess = (
  response,
  fallbackMessage
) => {
  if (!response?.data?.success) {
    throw new Error(
      response?.data?.message || fallbackMessage
    );
  }

  return extractData(response);
};

export const getNotifications = async ({
  limit = 50,
} = {}) => {
  const response = await api.get(
    "/notifications",
    {
      params: { limit },
    }
  );

  return ensureSuccess(
    response,
    "Unable to load notifications."
  );
};

export const markNotificationAsRead = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error(
      "Notification ID is required."
    );
  }

  const response = await api.patch(
    `/notifications/${encodeURIComponent(
      notificationId
    )}/read`
  );

  return ensureSuccess(
    response,
    "Unable to update notification."
  );
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return ensureSuccess(
    response,
    "Unable to update notifications."
  );
};

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;
