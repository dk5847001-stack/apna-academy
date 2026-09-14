import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminNotifications = async (params = {}) => unwrap(await api.get("/admin/notifications", { params }));

export const createAdminNotification = async (payload) => unwrap(await api.post("/admin/notifications", payload));

export const updateAdminNotification = async (notificationId, payload) => unwrap(await api.patch(`/admin/notifications/${encodeURIComponent(notificationId)}`, payload));

export const deleteAdminNotification = async (notificationId) => unwrap(await api.delete(`/admin/notifications/${encodeURIComponent(notificationId)}`));
