import api from "./api";

export const getCurrentAdmin = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

export const listAdminCourses = async (params = {}) => {
  const response = await api.get("/admin/courses", { params });
  return response.data.data;
};

export const getAdminCourse = async (courseId) => {
  const response = await api.get(`/admin/courses/${courseId}`);
  return response.data.data;
};

export const createAdminCourse = async (payload) => {
  const response = await api.post("/admin/courses", payload);
  return response.data.data;
};

export const updateAdminCourse = async (courseId, payload) => {
  const response = await api.patch(`/admin/courses/${courseId}`, payload);
  return response.data.data;
};

export const deleteAdminCourse = async (courseId) => {
  const response = await api.delete(`/admin/courses/${courseId}`);
  return response.data.data;
};

export const createAdminModule = async (courseId, payload) => {
  const response = await api.post(`/admin/courses/${courseId}/modules`, payload);
  return response.data.data;
};

export const updateAdminModule = async (moduleId, payload) => {
  const response = await api.patch(`/admin/modules/${moduleId}`, payload);
  return response.data.data;
};

export const deleteAdminModule = async (moduleId) => {
  const response = await api.delete(`/admin/modules/${moduleId}`);
  return response.data.data;
};

export const createAdminVideo = async (moduleId, payload) => {
  const response = await api.post(`/admin/modules/${moduleId}/videos`, payload);
  return response.data.data;
};

export const updateAdminVideo = async (videoId, payload) => {
  const response = await api.patch(`/admin/videos/${videoId}`, payload);
  return response.data.data;
};

export const deleteAdminVideo = async (videoId) => {
  const response = await api.delete(`/admin/videos/${videoId}`);
  return response.data.data;
};
