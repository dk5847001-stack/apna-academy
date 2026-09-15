import api from "./api";

export const listDsaProblems = async (params = {}) => {
  const response = await api.get("/admin/dsa/problems", { params });
  return response.data?.data || response.data;
};

export const createDsaProblem = async (payload) => {
  const response = await api.post("/admin/dsa/problems", payload);
  return response.data?.data || response.data;
};

export const updateDsaProblem = async (problemId, payload) => {
  const response = await api.patch(`/admin/dsa/problems/${problemId}`, payload);
  return response.data?.data || response.data;
};

export const archiveDsaProblem = async (problemId) => {
  const response = await api.delete(`/admin/dsa/problems/${problemId}`);
  return response.data?.data || response.data;
};

export const listDsaTestCases = async (problemId) => {
  const response = await api.get(`/admin/dsa/problems/${problemId}/test-cases`);
  return response.data?.data || response.data;
};

export const createDsaTestCase = async (problemId, payload) => {
  const response = await api.post(`/admin/dsa/problems/${problemId}/test-cases`, payload);
  return response.data?.data || response.data;
};

export const updateDsaTestCase = async (testCaseId, payload) => {
  const response = await api.patch(`/admin/dsa/test-cases/${testCaseId}`, payload);
  return response.data?.data || response.data;
};

export const deleteDsaTestCase = async (testCaseId) => {
  const response = await api.delete(`/admin/dsa/test-cases/${testCaseId}`);
  return response.data?.data || response.data;
};
