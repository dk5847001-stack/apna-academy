import api from "./api";

const ensureSuccess = (response, fallbackMessage) => {
  if (!response?.data?.success) throw new Error(response?.data?.message || fallbackMessage);
  return response?.data?.data ?? null;
};

export const getSupportTickets = async ({ status } = {}) => ensureSuccess(await api.get("/support", { params: status ? { status } : undefined }), "Unable to load support tickets.");
export const getSupportTicket = async (ticketId) => {
  if (!ticketId) throw new Error("Ticket ID is required.");
  return ensureSuccess(await api.get(`/support/${encodeURIComponent(ticketId)}`), "Unable to load support ticket.");
};
export const createSupportTicket = async (payload) => ensureSuccess(await api.post("/support", payload), "Unable to create support ticket.");
export const replyToSupportTicket = async (ticketId, message) => {
  if (!ticketId) throw new Error("Ticket ID is required.");
  return ensureSuccess(await api.post(`/support/${encodeURIComponent(ticketId)}/replies`, { message }), "Unable to send reply.");
};

const supportService = { getSupportTickets, getSupportTicket, createSupportTicket, replyToSupportTicket };
export default supportService;
