import { getProblemBySlug, getProgress, listCompanies, listProblems, listTopics } from "../services/dsa.service.js";

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const positiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

export const listDsaProblems = async (req, res, next) => {
  try {
    const page = positiveInt(req.query.page, 1, 100000);
    const limit = positiveInt(req.query.limit, 20, 50);
    const result = await listProblems({ userId: req.user?.userId, page, limit, search: typeof req.query.search === "string" ? req.query.search : "", difficulty: typeof req.query.difficulty === "string" ? req.query.difficulty : undefined, topic: typeof req.query.topic === "string" ? req.query.topic : undefined, company: typeof req.query.company === "string" ? req.query.company : undefined });
    return res.status(200).json({ success: true, data: result });
  } catch (error) { return next(error); }
};

export const getDsaProblem = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return res.status(400).json({ success: false, message: "Invalid problem slug." });
    const problem = await getProblemBySlug(req.user?.userId, slug);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found." });
    return res.status(200).json({ success: true, data: problem });
  } catch (error) { return next(error); }
};

export const getDsaProgress = async (req, res, next) => {
  try {
    const progress = await getProgress(req.user.userId);
    return res.status(200).json({ success: true, data: progress });
  } catch (error) { return next(error); }
};

export const getDsaTopics = asyncHandler(async (req, res) => {
  const topics = await listTopics();
  return res.status(200).json({ success: true, data: topics });
});

export const getDsaCompanies = asyncHandler(async (req, res) => {
  const companies = await listCompanies();
  return res.status(200).json({ success: true, data: companies });
});
