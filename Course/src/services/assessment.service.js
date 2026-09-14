import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const getStudentAssessment = async (courseId) =>
  unwrap(await api.get(`/assessment/courses/${encodeURIComponent(courseId)}`));

export const submitStudentAssessment = async (courseId, answers) =>
  unwrap(await api.post(`/assessment/courses/${encodeURIComponent(courseId)}/submit`, { answers }));
