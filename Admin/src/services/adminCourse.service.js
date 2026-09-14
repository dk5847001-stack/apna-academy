import api from "./api";

const ADMIN_COURSES = "/admin/courses";
const ADMIN_MODULES = "/admin/courses/modules";
const ADMIN_VIDEOS = "/admin/courses/videos";

export const getCurrentAdmin = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

export const listAdminCourses = async (params = {}) => {
  const response = await api.get(ADMIN_COURSES, { params });
  return response.data.data;
};

export const getAdminCourse = async (courseId) => {
  const response = await api.get(`${ADMIN_COURSES}/${courseId}`);
  return response.data.data;
};

export const createAdminCourse = async (payload) => {
  const response = await api.post(ADMIN_COURSES, payload);
  return response.data.data;
};

export const updateAdminCourse = async (courseId, payload) => {
  const response = await api.patch(`${ADMIN_COURSES}/${courseId}`, payload);
  return response.data.data;
};

export const deleteAdminCourse = async (courseId) => {
  const response = await api.delete(`${ADMIN_COURSES}/${courseId}`);
  return response.data.data;
};

export const createAdminModule = async (courseId, payload) => {
  const response = await api.post(`${ADMIN_COURSES}/${courseId}/modules`, payload);
  return response.data.data;
};

export const updateAdminModule = async (moduleId, payload) => {
  const response = await api.patch(`${ADMIN_MODULES}/${moduleId}`, payload);
  return response.data.data;
};

export const deleteAdminModule = async (moduleId) => {
  const response = await api.delete(`${ADMIN_MODULES}/${moduleId}`);
  return response.data.data;
};

export const createAdminVideo = async (moduleId, payload) => {
  const response = await api.post(`${ADMIN_MODULES}/${moduleId}/videos`, payload);
  return response.data.data;
};

export const updateAdminVideo = async (videoId, payload) => {
  const response = await api.patch(`${ADMIN_VIDEOS}/${videoId}`, payload);
  return response.data.data;
};

export const deleteAdminVideo = async (videoId) => {
  const response = await api.delete(`${ADMIN_VIDEOS}/${videoId}`);
  return response.data.data;
};
