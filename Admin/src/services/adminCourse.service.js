import api from "./api";

const ADMIN_COURSES = "/admin/courses";
const ADMIN_MODULES = "/admin/courses/modules";
const ADMIN_VIDEOS = "/admin/courses/videos";

/*
 * React development StrictMode intentionally re-runs effects. More than one
 * component can also request the same resource during bootstrap. Share the
 * in-flight GET instead of creating duplicate database work.
 */
let currentAdminRequest = null;
const adminCourseListRequests = new Map();
const adminCourseDetailRequests = new Map();

const requestOnce = (map, key, requestFactory) => {
  if (map.has(key)) return map.get(key);

  const request = requestFactory().finally(() => {
    map.delete(key);
  });

  map.set(key, request);
  return request;
};

export const getCurrentAdmin = async () => {
  if (!currentAdminRequest) {
    currentAdminRequest = api
      .get("/auth/me")
      .then((response) => response.data.data)
      .finally(() => {
        currentAdminRequest = null;
      });
  }

  return currentAdminRequest;
};

export const listAdminCourses = async (params = {}) => {
  const key = JSON.stringify({
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    search: params.search ?? "",
  });

  return requestOnce(adminCourseListRequests, key, async () => {
    const response = await api.get(ADMIN_COURSES, { params });
    return response.data.data;
  });
};

export const getAdminCourse = async (courseId) =>
  requestOnce(adminCourseDetailRequests, String(courseId), async () => {
    const response = await api.get(`${ADMIN_COURSES}/${courseId}`);
    return response.data.data;
  });

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
