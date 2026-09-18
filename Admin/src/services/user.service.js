import api from "./api";

const ADMIN_USERS = "/admin/users";

export const listAdminUsers = async (params = {}) => {
  const response = await api.get(ADMIN_USERS, { params });
  return response.data.data;
};

export const getAdminUser = async (userId) => {
  const response = await api.get(`${ADMIN_USERS}/${userId}`);
  return response.data.data;
};

export const blockAdminUser = async (userId, reason) => {
  const response = await api.post(`${ADMIN_USERS}/${userId}/block`, { reason });
  return response.data.data;
};

export const unblockAdminUser = async (userId) => {
  const response = await api.post(`${ADMIN_USERS}/${userId}/unblock`);
  return response.data.data;
};

export const activateAdminUser = async (userId) => {
  const response = await api.post(`${ADMIN_USERS}/${userId}/activate`);
  return response.data.data;
};

export const suspendAdminUser = async (userId, reason) => {
  const response = await api.post(`${ADMIN_USERS}/${userId}/suspend`, { reason });
  return response.data.data;
};

export const getAdminSecurityDetails = async (userId) => {
  const response = await api.get(`${ADMIN_USERS}/${userId}/security`);
  return response.data.data;
};

export const unfreezeAdminUser = async (userId) => {
  const response = await api.post(`${ADMIN_USERS}/${userId}/security/unfreeze`);
  return response.data.data;
};
