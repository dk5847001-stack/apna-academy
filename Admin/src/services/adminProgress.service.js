import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminProgress = async (params = {}) => {
  const response = await api.get("/admin/progress", { params });
  return unwrap(response);
};

export const getAdminProgress = async (progressId) => {
  const response = await api.get(`/admin/progress/${progressId}`);
  return unwrap(response);
};
