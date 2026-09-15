const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload?.data ?? payload;
};

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const listDsaProblems = (params = {}) => request(`/dsa/problems${toQuery(params)}`);
export const getDsaProblem = (slug) => request(`/dsa/problems/${encodeURIComponent(slug)}`);
export const getDsaProgress = () => request("/dsa/progress");
export const getDsaTopics = () => request("/dsa/topics");
export const getDsaCompanies = () => request("/dsa/companies");
export const getDsaDailyChallenge = () => request("/dsa/daily-challenge");
export const getDsaStudyPlans = () => request("/dsa/study-plans");
export const getDsaStudyPlan = (slug) => request(`/dsa/study-plans/${encodeURIComponent(slug)}`);
export const getDsaSubscription = () => request("/dsa/payments/subscription");
export const createDsaPremiumOrder = () => request("/dsa/payments/create-order", { method: "POST", body: JSON.stringify({}) });
export const verifyDsaPremiumPayment = (payload) => request("/dsa/payments/verify", { method: "POST", body: JSON.stringify(payload) });
