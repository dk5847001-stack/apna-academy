import api from "./api";

export const getAdminAIUsage = async (params = {}) => {
  const response = await api.get("/admin/ai/usage", { params });
  return response?.data?.data ?? response?.data ?? {};
};
