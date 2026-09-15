import DsaEntitlement from "../models/DsaEntitlement.js";
import DsaProblem from "../models/DsaProblem.js";
import DsaProgress from "../models/DsaProgress.js";

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

export const listProblems = async ({ userId, page = 1, limit = 20, search = "", difficulty, topic, company }) => {
  const premium = await hasPremiumAccess(userId);
  const filter = { status: "PUBLISHED" };

  if (!premium) filter.isPremium = false;
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

  const skip = (page - 1) * limit;
  const projection = premium ? premiumProjection : publicProjection;
  const [items, total] = await Promise.all([
    DsaProblem.find(filter).select(projection).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    DsaProblem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    access: { premium, freePercent: FREE_PERCENT, lockedPercent: 100 - FREE_PERCENT },
  };
};

export const getProblemBySlug = async (userId, slug) => {
  const premium = await hasPremiumAccess(userId);
  const problem = await DsaProblem.findOne({ slug: slug.toLowerCase(), status: "PUBLISHED" })
    .select(premium ? premiumProjection : publicProjection)
    .lean();

  if (!problem) return null;
  if (problem.isPremium && !premium) return { locked: true, slug: problem.slug, title: problem.title, difficulty: problem.difficulty };
  return { ...problem, locked: false };
};

export const getProgress = async (userId) => {
  const progress = await DsaProgress.findOne({ userId }).lean();
  return progress || {
    userId,
    solvedProblemIds: [],
    attemptedProblemIds: [],
    totalSolved: 0,
    totalAttempted: 0,
    currentStreak: 0,
    longestStreak: 0,
    xp: 0,
  };
};
