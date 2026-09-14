import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminSubscribers = async (params = {}) => unwrap(await api.get("/admin/subscribers", { params }));
export const updateAdminSubscriber = async (id, status) => unwrap(await api.patch(`/admin/subscribers/${encodeURIComponent(id)}`, { status }));
