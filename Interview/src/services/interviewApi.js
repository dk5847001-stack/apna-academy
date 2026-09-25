const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 150_000;

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number(options.timeoutMs || DEFAULT_TIMEOUT_MS));
  const { timeoutMs, ...fetchOptions } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(fetchOptions.headers || {}) },
      ...fetchOptions,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(payload?.message || "Interview API request failed.");
      error.status = response.status;
      error.code = payload?.code || (response.status === 401 ? "AUTH_REQUIRED" : response.status === 429 ? "RATE_LIMITED" : "INTERVIEW_API_ERROR");
      error.requestId = response.headers.get("X-Request-ID") || payload?.requestId || "";
      error.retryAfter = Number(response.headers.get("Retry-After") || 0);
      throw error;
    }
    return payload?.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("The request timed out. Check your connection and try again.");
      timeoutError.code = "REQUEST_TIMEOUT";
      timeoutError.status = 504;
      throw timeoutError;
    }
    if (error instanceof TypeError) {
      const networkError = new Error("Unable to reach the interview server. Please check your connection.");
      networkError.code = "NETWORK_ERROR";
      networkError.status = 0;
      throw networkError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export async function createInterview(payload) {
  return request("/interviews/sessions", { method: "POST", body: JSON.stringify(payload), timeoutMs: 150_000 });
}

export async function submitInterviewAnswer({ sessionId, questionId, answer }) {
  return request(`/interviews/sessions/${encodeURIComponent(sessionId)}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, answer }),
    timeoutMs: 150_000,
  });
}

export async function completeInterview(sessionId) {
  return request(`/interviews/sessions/${encodeURIComponent(sessionId)}/complete`, { method: "POST", timeoutMs: 150_000 });
}

export async function getInterviewResult(sessionId) {
  return request(`/interviews/sessions/${encodeURIComponent(sessionId)}/result`, { method: "GET", timeoutMs: 15_000 });
}

export async function getInterviewHistory() {
  return request("/interviews/history", { method: "GET", timeoutMs: 15_000 });
}

export const interviewApi = {
  createInterview,
  submitInterviewAnswer,
  completeInterview,
  getInterviewResult,
  getInterviewHistory,
};
