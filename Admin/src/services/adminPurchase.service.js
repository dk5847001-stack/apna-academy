import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminPurchases = async (params = {}) => {
  const response = await api.get("/admin/purchases", { params });
  return unwrap(response);
};

export const getAdminPurchase = async (purchaseId) => {
  const response = await api.get(`/admin/purchases/${purchaseId}`);
  return unwrap(response);
};
