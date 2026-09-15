import DsaProblem from "../modules/dsa/models/DsaProblem.js";
import DsaTestCase from "../modules/dsa/models/DsaTestCase.js";

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const listProblems = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const filter = {};

  if (["EASY", "MEDIUM", "HARD"].includes(String(req.query.difficulty || "").toUpperCase())) {
    filter.difficulty = String(req.query.difficulty).toUpperCase();
  }
  if (["FREE", "PREMIUM"].includes(String(req.query.accessType || "").toUpperCase())) {
    filter.accessType = String(req.query.accessType).toUpperCase();
  }
  if (["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"].includes(String(req.query.status || "").toUpperCase())) {
    filter.status = String(req.query.status).toUpperCase();
  }

  const [items, total] = await Promise.all([
    DsaProblem.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    DsaProblem.countDocuments(filter),
  ]);

  res.json({ success: true, data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const createProblem = asyncHandler(async (req, res) => {
  const problem = await DsaProblem.create({ ...req.body, createdBy: req.admin?._id });
  res.status(201).json({ success: true, data: problem });
});

export const updateProblem = asyncHandler(async (req, res) => {
  const problem = await DsaProblem.findByIdAndUpdate(
    req.params.problemId,
    { $set: { ...req.body, updatedBy: req.admin?._id } },
    { new: true, runValidators: true }
  );
  if (!problem) return res.status(404).json({ success: false, message: "DSA problem not found." });
  res.json({ success: true, data: problem });
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await DsaProblem.findByIdAndUpdate(
    req.params.problemId,
    { $set: { status: "ARCHIVED", updatedBy: req.admin?._id } },
    { new: true }
  );
  if (!problem) return res.status(404).json({ success: false, message: "DSA problem not found." });
  res.json({ success: true, message: "DSA problem archived successfully." });
});

export const listTestCases = asyncHandler(async (req, res) => {
  const items = await DsaTestCase.find({ problem: req.params.problemId })
    .select("_id problem input expectedOutput isHidden order status createdAt updatedAt")
    .sort({ order: 1 })
    .lean();
  res.json({ success: true, data: items });
});

export const createTestCase = asyncHandler(async (req, res) => {
  const item = await DsaTestCase.create({ ...req.body, problem: req.params.problemId });
  res.status(201).json({ success: true, data: item });
});

export const updateTestCase = asyncHandler(async (req, res) => {
  const item = await DsaTestCase.findByIdAndUpdate(req.params.testCaseId, { $set: req.body }, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: "Test case not found." });
  res.json({ success: true, data: item });
});

export const deleteTestCase = asyncHandler(async (req, res) => {
  const item = await DsaTestCase.findByIdAndDelete(req.params.testCaseId);
  if (!item) return res.status(404).json({ success: false, message: "Test case not found." });
  res.json({ success: true, message: "Test case deleted successfully." });
});
