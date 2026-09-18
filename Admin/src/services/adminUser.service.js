import api from "./api";
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
export const listAdminUsers = async (params = {}) => unwrap(await api.get("/admin/users", { params }));
export const getAdminUser = async (userId) => unwrap(await api.get(`/admin/users/${userId}`));
export const getAdminUserDetails = async (userId) => unwrap(await api.get(`/admin/users/${encodeURIComponent(userId)}/details`));
export const updateAdminUser = async (userId, payload) => unwrap(await api.patch(`/admin/users/${userId}`, payload));

export const blockAdminUser = async (userId, reason = "") => unwrap(await api.post(`/admin/users/${userId}/block`, { reason }));
export const unblockAdminUser = async (userId) => unwrap(await api.post(`/admin/users/${userId}/unblock`));
export const suspendAdminUser = async (userId, reason = "") => unwrap(await api.post(`/admin/users/${userId}/suspend`, { reason }));
export const activateAdminUser = async (userId) => unwrap(await api.post(`/admin/users/${userId}/activate`));
export const unfreezeAdminUser = async (userId) => unwrap(await api.post(`/admin/users/${userId}/security/unfreeze`));
