import api from "./api";
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
export const listAdminPromoCodes = async (params = {}) => unwrap(await api.get("/admin/promocodes", { params }));
export const getAdminPromoCode = async (promoId) => unwrap(await api.get(`/admin/promocodes/${promoId}`));
export const createAdminPromoCode = async (payload) => unwrap(await api.post("/admin/promocodes", payload));
export const updateAdminPromoCode = async (promoId, payload) => unwrap(await api.patch(`/admin/promocodes/${promoId}`, payload));
export const toggleAdminPromoCode = async (promoId, isActive) => unwrap(await api.post(`/admin/promocodes/${promoId}/toggle`, { isActive }));
export const deleteAdminPromoCode = async (promoId) => unwrap(await api.delete(`/admin/promocodes/${promoId}`));