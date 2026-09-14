import api from "./api";

export const getAdminAnalytics = async (params = {}) => {
  const response = await api.get("/admin/analytics", { params });
  return response?.data?.data ?? response?.data ?? {};
};
