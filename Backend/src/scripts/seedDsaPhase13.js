import "dotenv/config";
import mongoose from "mongoose";
import DsaProblem from "../models/DsaProblem.js";
import DsaDailyChallenge from "../models/DsaDailyChallenge.js";
import DsaStudyPlan from "../models/DsaStudyPlan.js";

const problemSlugs = [
  "two-sum", "valid-parentheses", "best-time-to-buy-and-sell-stock", "binary-search",
  "contains-duplicate", "product-of-array-except-self", "maximum-subarray", "merge-intervals",
  "longest-substring-without-repeating-characters", "3sum", "group-anagrams", "top-k-frequent-elements",
  "number-of-islands", "course-schedule", "binary-tree-level-order-traversal", "lowest-common-ancestor-of-a-binary-tree",
  "coin-change", "longest-increasing-subsequence", "trapping-rain-water", "median-of-two-sorted-arrays",
];

const connect = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is required.");
  await mongoose.connect(uri);
};

const buildDays = (ids, count, label) => Array.from({ length: count }, (_, index) => ({
  day: index + 1,
  title: `${label} — Day ${index + 1}`,
  problemIds: [ids[index % ids.length]],
}));

const run = async () => {
  await connect();
  const problems = await DsaProblem.find({ slug: { $in: problemSlugs }, status: "PUBLISHED" }).select("_id slug").lean();
  const bySlug = new Map(problems.map((item) => [item.slug, item._id]));
  const ids = problemSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  if (ids.length < 4) throw new Error("Publish the Phase 11 DSA problems before running this seed.");

  const plans = [
    { slug: "30-day-dsa-foundation", title: "30-Day DSA Foundation", description: "Build strong fundamentals with a focused daily problem-solving routine.", durationDays: 30, level: "Beginner", focus: ["Arrays", "Strings", "Hashing", "Binary Search"], order: 1 },
    { slug: "60-day-dsa-interview", title: "60-Day DSA Interview Prep", description: "Move from fundamentals to common interview patterns and medium-level problems.", durationDays: 60, level: "Intermediate", focus: ["Patterns", "Trees", "Graphs", "Dynamic Programming"], order: 2 },
    { slug: "90-day-dsa-mastery", title: "90-Day DSA Mastery", description: "A long-form interview preparation track covering core patterns and advanced problems.", durationDays: 90, level: "Advanced", focus: ["Advanced Patterns", "Graphs", "DP", "Interview Practice"], order: 3 },
  ];

  for (const plan of plans) {
    await DsaStudyPlan.findOneAndUpdate(
      { slug: plan.slug },
      { $set: { ...plan, days: buildDays(ids, plan.durationDays, plan.title), isPublished: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const start = new Date(); start.setHours(0, 0, 0, 0);
  await DsaDailyChallenge.findOneAndUpdate(
    { challengeDate: start },
    { $set: { problemId: ids[Math.floor(Date.now() / 86400000) % ids.length], title: "Today's DSA Challenge", description: "Solve one carefully selected problem today and keep your streak alive.", isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Phase 13 seed complete: ${plans.length} study plans + today's challenge.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Phase 13 seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
