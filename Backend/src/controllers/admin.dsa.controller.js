import DsaProblem from "../models/DsaProblem.js";
import DsaTestCase from "../models/DsaTestCase.js";

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const normalizeDifficulty = (value) => String(value || "").trim().toLowerCase().replace(/^./, (char) => char.toUpperCase());

export const listProblems = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const filter = {};

  const difficulty = normalizeDifficulty(req.query.difficulty);
  if (["Easy", "Medium", "Hard"].includes(difficulty)) filter.difficulty = difficulty;

  const accessType = String(req.query.accessType || "").toUpperCase();
  if (accessType === "FREE") filter.isPremium = false;
  if (accessType === "PREMIUM") filter.isPremium = true;

  const status = String(req.query.status || "").toUpperCase();
  if (["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"].includes(status)) filter.status = status;

  const search = String(req.query.search || "").trim();
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { slug: { $regex: safe, $options: "i" } },
      { topics: { $regex: safe, $options: "i" } },
      { companies: { $regex: safe, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    DsaProblem.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    DsaProblem.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

export const createProblem = asyncHandler(async (req, res) => {
  const problem = await DsaProblem.create({ ...req.body });
  res.status(201).json({ success: true, data: problem });
});

export const updateProblem = asyncHandler(async (req, res) => {
  const problem = await DsaProblem.findByIdAndUpdate(
    req.params.problemId,
    { $set: { ...req.body } },
    { new: true, runValidators: true }
  );
  if (!problem) return res.status(404).json({ success: false, message: "DSA problem not found." });
  res.json({ success: true, data: problem });
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await DsaProblem.findByIdAndUpdate(
    req.params.problemId,
    { $set: { status: "ARCHIVED" } },
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
