const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || "Interview API request failed.");
    error.status = response.status;
    error.code = payload?.code;
    throw error;
  }
  return payload?.data;
};

export async function createInterview(payload) {
  return request("/interviews/sessions", { method: "POST", body: JSON.stringify(payload) });
}

export async function submitInterviewAnswer({ sessionId, questionId, answer }) {
  return request(`/interviews/sessions/${encodeURIComponent(sessionId)}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, answer }),
  });
}

export async function completeInterview(sessionId) {
  return request(`/interviews/sessions/${encodeURIComponent(sessionId)}/complete`, { method: 'POST' })
}

export async function getInterviewResult(sessionId) {
  return request(`/interviews/sessions/${encodeURIComponent(sessionId)}/result`);
}

export async function getInterviewHistory() {
  return request("/interviews/history");
}

export const interviewApi = {
  createInterview,
  submitInterviewAnswer,
  completeInterview,
  getInterviewResult,
  getInterviewHistory,
};
