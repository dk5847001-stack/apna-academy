import api from "./api";
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
export const listAdminUsers = async (params = {}) => unwrap(await api.get("/admin/users", { params }));
export const getAdminUser = async (userId) => unwrap(await api.get(`/admin/users/${userId}`));
export const getAdminUserDetails = async (userId) => unwrap(await api.get(`/admin/users/${encodeURIComponent(userId)}/details`));
export const updateAdminUser = async (userId, payload) => unwrap(await api.patch(`/admin/users/${userId}`, payload));
