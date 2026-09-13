import api from "./api";

const ensureSuccess = (response, fallbackMessage) => {
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || fallbackMessage);
  }

  return response?.data?.data ?? null;
};

export const getSupportTickets = async ({ status } = {}) => {
  const response = await api.get("/support", {
    params: status ? { status } : undefined,
  });

  return ensureSuccess(response, "Unable to load support tickets.");
};

export const getSupportTicket = async (ticketId) => {
  if (!ticketId) {
    throw new Error("Ticket ID is required.");
  }

  const response = await api.get(
    `/support/${encodeURIComponent(ticketId)}`
  );

  return ensureSuccess(response, "Unable to load support ticket.");
};

export const createSupportTicket = async (payload) => {
  const response = await api.post("/support", payload);

  return ensureSuccess(response, "Unable to create support ticket.");
};

const supportService = {
  getSupportTickets,
  getSupportTicket,
  createSupportTicket,
};

export default supportService;
