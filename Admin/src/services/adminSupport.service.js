import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminTickets = async (params = {}) => unwrap(await api.get("/admin/support", { params }));
export const getAdminTicket = async (ticketId) => unwrap(await api.get(`/admin/support/${encodeURIComponent(ticketId)}`));
export const updateAdminTicket = async (ticketId, payload) => unwrap(await api.patch(`/admin/support/${encodeURIComponent(ticketId)}`, payload));
