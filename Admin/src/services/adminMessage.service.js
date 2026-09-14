import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminMessages = async (params = {}) => unwrap(await api.get("/admin/messages", { params }));
export const getAdminMessage = async (id) => unwrap(await api.get(`/admin/messages/${encodeURIComponent(id)}`));
export const updateAdminMessage = async (id, payload) => unwrap(await api.patch(`/admin/messages/${encodeURIComponent(id)}`, payload));
