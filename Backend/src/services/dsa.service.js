import DsaEntitlement from "../models/DsaEntitlement.js";
import DsaProblem from "../models/DsaProblem.js";
import DsaProgress from "../models/DsaProgress.js";
import DsaStudyPlan from "../models/DsaStudyPlan.js";

const FREE_PERCENT = 20;

export const hasPremiumAccess = async (userId) => {
  if (!userId) return false;

  const entitlement = await DsaEntitlement.findOne({
    userId,
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    accessType: { $in: ["PREMIUM", "ADMIN"] },
  }).lean();

  return Boolean(entitlement);
};

const publicProjection = {
  slug: 1,
  title: 1,
  description: 1,
  difficulty: 1,
  topics: 1,
  companies: 1,
  patterns: 1,
  examples: 1,
  constraints: 1,
  supportedLanguages: 1,
  isPremium: 1,
  order: 1,
};

const premiumProjection = {
  ...publicProjection,
  hints: 1,
  editorial: 1,
  solution: 1,
  starterCode: 1,
  timeLimitMs: 1,
  memoryLimitMb: 1,
};

const buildSearchFilter = ({ search = "", difficulty, topic, company } = {}) => {
  const filter = { status: "PUBLISHED" };
  if (difficulty) filter.difficulty = difficulty;
  if (topic) filter.topics = topic;
  if (company) filter.companies = company;
  if (search.trim()) {
    const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { slug: { $regex: safe, $options: "i" } },
      { topics: { $regex: safe, $options: "i" } },
      { companies: { $regex: safe, $options: "i" } },
    ];
  }
  return filter;
};

export const listProblems = async ({ userId, page = 1, limit = 20, search = "", difficulty, topic, company }) => {
  const premium = await hasPremiumAccess(userId);
  const filter = buildSearchFilter({ search, difficulty, topic, company });
  const skip = (page - 1) * limit;
  const [items, total, freeTotal, premiumTotal] = await Promise.all([
    DsaProblem.find(filter).select(publicProjection).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    DsaProblem.countDocuments(filter),
    DsaProblem.countDocuments({ ...filter, isPremium: false }),
    DsaProblem.countDocuments({ ...filter, isPremium: true }),
  ]);

  const visibleItems = items.map((item) => {
    if (!item.isPremium || premium) return { ...item, locked: false };
    return {
      slug: item.slug,
      title: item.title,
      description: item.description,
      difficulty: item.difficulty,
      topics: item.topics,
      companies: item.companies,
      patterns: item.patterns,
      supportedLanguages: item.supportedLanguages,
      isPremium: true,
      order: item.order,
      locked: true,
    };
  });

  return {
    items: visibleItems,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    access: { premium, freePercent: FREE_PERCENT, lockedPercent: 100 - FREE_PERCENT, freeTotal, premiumTotal },
  };
};

export const listTopics = async () => {
  const rows = await DsaProblem.aggregate([
    { $match: { status: "PUBLISHED" } },
    { $unwind: "$topics" },
    { $match: { topics: { $type: "string", $ne: "" } } },
    {
      $group: {
        _id: "$topics",
        total: { $sum: 1 },
        free: { $sum: { $cond: [{ $eq: ["$isPremium", false] }, 1, 0] } },
        premium: { $sum: { $cond: [{ $eq: ["$isPremium", true] }, 1, 0] } },
        easy: { $sum: { $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0] } },
        hard: { $sum: { $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0] } },
      },
    },
    { $sort: { total: -1, _id: 1 } },
    { $project: { _id: 0, name: "$_id", total: 1, free: 1, premium: 1, easy: 1, medium: 1, hard: 1 } },
  ]);
  return rows;
};

export const listCompanies = async () => {
  const rows = await DsaProblem.aggregate([
    { $match: { status: "PUBLISHED" } },
    { $unwind: "$companies" },
    { $match: { companies: { $type: "string", $ne: "" } } },
    {
      $group: {
        _id: "$companies",
        total: { $sum: 1 },
        free: { $sum: { $cond: [{ $eq: ["$isPremium", false] }, 1, 0] } },
        premium: { $sum: { $cond: [{ $eq: ["$isPremium", true] }, 1, 0] } },
        easy: { $sum: { $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0] } },
        hard: { $sum: { $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0] } },
      },
    },
    { $sort: { total: -1, _id: 1 } },
    { $project: { _id: 0, name: "$_id", total: 1, free: 1, premium: 1, easy: 1, medium: 1, hard: 1 } },
  ]);
  return rows;
};

export const getProblemBySlug = async (userId, slug) => {
  const premium = await hasPremiumAccess(userId);
  const problem = await DsaProblem.findOne({ slug: slug.toLowerCase(), status: "PUBLISHED" })
    .select(premium ? premiumProjection : publicProjection)
    .lean();

  if (!problem) return null;
  if (problem.isPremium && !premium) {
    return { locked: true, slug: problem.slug, title: problem.title, difficulty: problem.difficulty, topics: problem.topics, companies: problem.companies };
  }
  return { ...problem, locked: false };
};

export const getDsaSeoIndex = async () => {
  const [problems, studyPlans] = await Promise.all([
    DsaProblem.find({ status: "PUBLISHED" })
      .select("slug title description difficulty topics isPremium order updatedAt")
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    DsaStudyPlan.find({ isPublished: true })
      .select("slug title description durationDays level focus order updatedAt")
      .sort({ order: 1, durationDays: 1 })
      .lean(),
  ]);

  return {
    problems: problems.map(({ slug, title, description, difficulty, topics, isPremium, order, updatedAt }) => ({
      slug, title, description, difficulty, topics, isPremium, order, updatedAt,
    })),
    studyPlans: studyPlans.map(({ slug, title, description, durationDays, level, focus, order, updatedAt }) => ({
      slug, title, description, durationDays, level, focus, order, updatedAt,
    })),
  };
};

export const getProgress = async (userId) => {
  const progress = await DsaProgress.findOne({ userId }).lean();
  return progress || { userId, solvedProblemIds: [], attemptedProblemIds: [], totalSolved: 0, totalAttempted: 0, currentStreak: 0, longestStreak: 0, xp: 0 };
};
