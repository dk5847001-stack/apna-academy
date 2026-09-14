import api from "./api";

export const getAdminAnalytics = async () => {
  const response = await api.get("/admin/analytics");
  return response?.data?.data ?? response?.data ?? {};
};
