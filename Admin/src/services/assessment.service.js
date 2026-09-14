import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listAdminAssessments = async () => unwrap(await api.get("/admin/assessments"));

export const getAdminAssessment = async (assessmentId) =>
  unwrap(await api.get(`/admin/assessments/${encodeURIComponent(assessmentId)}`));

export const createAdminAssessment = async (payload) =>
  unwrap(await api.post("/admin/assessments", payload));

export const updateAdminAssessment = async (assessmentId, payload) =>
  unwrap(await api.patch(`/admin/assessments/${encodeURIComponent(assessmentId)}`, payload));

export const deleteAdminAssessment = async (assessmentId) =>
  unwrap(await api.delete(`/admin/assessments/${encodeURIComponent(assessmentId)}`));
