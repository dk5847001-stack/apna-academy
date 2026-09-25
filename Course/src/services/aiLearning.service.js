import api from "./api";

const post = async (path, body) => {
  const response = await api.post(path, body);
  const data = response?.data;
  if (!data?.success) throw new Error(data?.message || "AI learning request failed.");
  return data.data;
};

export const explainTopic = (courseId, body) =>
  post("/ai/learning/courses/" + encodeURIComponent(courseId) + "/explain", body);

export const summarizeLesson = (courseId, body) =>
  post("/ai/learning/courses/" + encodeURIComponent(courseId) + "/summarize", body);

export const generatePracticeQuiz = (courseId, body) =>
  post("/ai/learning/courses/" + encodeURIComponent(courseId) + "/quiz", body);

export const generateStudyPlan = (courseId, body) =>
  post("/ai/learning/courses/" + encodeURIComponent(courseId) + "/study-plan", body);

export const reviewCode = (courseId, body) =>
  post("/ai/learning/courses/" + encodeURIComponent(courseId) + "/code-review", body);
