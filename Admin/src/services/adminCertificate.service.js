import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminCertificates = async (params = {}) => {
  const response = await api.get("/admin/certificates", { params });
  return unwrap(response);
};

export const getAdminCertificate = async (certificateId) => {
  const response = await api.get(`/admin/certificates/${certificateId}`);
  return unwrap(response);
};

export const updateAdminCertificate = async (certificateId, isValid) => {
  const response = await api.patch(`/admin/certificates/${certificateId}`, { isValid });
  return unwrap(response);
};
