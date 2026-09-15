import DsaDailyChallenge from "../models/DsaDailyChallenge.js";
import DsaProblem from "../models/DsaProblem.js";
import DsaStudyPlan from "../models/DsaStudyPlan.js";
import { hasPremiumAccess } from "./dsa.service.js";

const problemProjection = {
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

const premiumProblemProjection = {
  ...problemProjection,
  hints: 1,
  editorial: 1,
  solution: 1,
  starterCode: 1,
  timeLimitMs: 1,
  memoryLimitMb: 1,
};

const dayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const getDailyChallenge = async (userId, date = new Date()) => {
  const premium = await hasPremiumAccess(userId);
  const { start, end } = dayBounds(date);
  const challenge = await DsaDailyChallenge.findOne({ challengeDate: { $gte: start, $lt: end }, isActive: true })
    .populate({ path: "problemId", select: premium ? premiumProblemProjection : problemProjection })
    .lean();

  if (!challenge?.problemId || challenge.problemId.status === "ARCHIVED") return null;
  const problem = challenge.problemId;
  if (problem.isPremium && !premium) {
    return {
      date: start.toISOString().slice(0, 10),
      title: challenge.title || problem.title,
      description: challenge.description || "Solve today's selected DSA problem.",
      problem: { slug: problem.slug, title: problem.title, difficulty: problem.difficulty, topics: problem.topics, companies: problem.companies, isPremium: true, locked: true },
    };
  }
  return { date: start.toISOString().slice(0, 10), title: challenge.title || problem.title, description: challenge.description || "Solve today's selected DSA problem.", problem: { ...problem, locked: false } };
};

export const listStudyPlans = async () => {
  return DsaStudyPlan.find({ isPublished: true })
    .select("slug title description durationDays level focus days order")
    .populate({ path: "days.problemIds", select: "slug title difficulty topics isPremium" })
    .sort({ order: 1, durationDays: 1 })
    .lean();
};

export const getStudyPlan = async (slug) => {
  return DsaStudyPlan.findOne({ slug: slug.toLowerCase(), isPublished: true })
    .select("slug title description durationDays level focus days order")
    .populate({ path: "days.problemIds", select: "slug title difficulty topics companies isPremium" })
    .lean();
};
