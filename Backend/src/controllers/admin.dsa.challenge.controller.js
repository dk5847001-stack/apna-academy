import DsaDailyChallenge from "../models/DsaDailyChallenge.js";
import DsaProblem from "../models/DsaProblem.js";
import DsaStudyPlan from "../models/DsaStudyPlan.js";

const id = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

export const listDailyChallenges = async (req, res, next) => {
  try {
    const items = await DsaDailyChallenge.find().populate("problemId", "slug title difficulty").sort({ challengeDate: -1 }).limit(100).lean();
    return res.json({ success: true, data: items });
  } catch (error) { return next(error); }
};

export const createDailyChallenge = async (req, res, next) => {
  try {
    const { challengeDate, problemId, title = "", description = "", isActive = true } = req.body || {};
    if (!id(problemId) || !challengeDate) return res.status(400).json({ success: false, message: "challengeDate and a valid problemId are required." });
    const problem = await DsaProblem.findOne({ _id: problemId, status: "PUBLISHED" }).select("_id").lean();
    if (!problem) return res.status(400).json({ success: false, message: "Published DSA problem not found." });
    const item = await DsaDailyChallenge.create({ challengeDate: new Date(challengeDate), problemId, title, description, isActive });
    return res.status(201).json({ success: true, data: item });
  } catch (error) { return next(error); }
};

export const updateDailyChallenge = async (req, res, next) => {
  try {
    const updates = {};
    for (const key of ["challengeDate", "problemId", "title", "description", "isActive"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    if (updates.problemId) {
      if (!id(updates.problemId)) return res.status(400).json({ success: false, message: "Invalid problemId." });
      const problem = await DsaProblem.findOne({ _id: updates.problemId, status: "PUBLISHED" }).select("_id").lean();
      if (!problem) return res.status(400).json({ success: false, message: "Published DSA problem not found." });
    }
    if (updates.challengeDate) updates.challengeDate = new Date(updates.challengeDate);
    const item = await DsaDailyChallenge.findByIdAndUpdate(req.params.challengeId, updates, { new: true, runValidators: true }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Daily challenge not found." });
    return res.json({ success: true, data: item });
  } catch (error) { return next(error); }
};

export const deleteDailyChallenge = async (req, res, next) => {
  try {
    const item = await DsaDailyChallenge.findByIdAndDelete(req.params.challengeId);
    if (!item) return res.status(404).json({ success: false, message: "Daily challenge not found." });
    return res.json({ success: true, message: "Daily challenge deleted." });
  } catch (error) { return next(error); }
};

export const listStudyPlansAdmin = async (req, res, next) => {
  try { return res.json({ success: true, data: await DsaStudyPlan.find().populate("days.problemIds", "slug title difficulty").sort({ order: 1, durationDays: 1 }).lean() }); }
  catch (error) { return next(error); }
};

export const createStudyPlan = async (req, res, next) => {
  try {
    const { slug, title, description, durationDays, level, focus = [], days = [], isPublished = true, order = 0 } = req.body || {};
    if (!slug || !title || !description || ![30, 60, 90].includes(Number(durationDays))) return res.status(400).json({ success: false, message: "slug, title, description and durationDays (30/60/90) are required." });
    const item = await DsaStudyPlan.create({ slug, title, description, durationDays: Number(durationDays), level, focus, days, isPublished, order });
    return res.status(201).json({ success: true, data: item });
  } catch (error) { return next(error); }
};

export const updateStudyPlan = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.durationDays !== undefined) updates.durationDays = Number(updates.durationDays);
    const item = await DsaStudyPlan.findByIdAndUpdate(req.params.planId, updates, { new: true, runValidators: true }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Study plan not found." });
    return res.json({ success: true, data: item });
  } catch (error) { return next(error); }
};

export const deleteStudyPlan = async (req, res, next) => {
  try {
    const item = await DsaStudyPlan.findByIdAndDelete(req.params.planId);
    if (!item) return res.status(404).json({ success: false, message: "Study plan not found." });
    return res.json({ success: true, message: "Study plan deleted." });
  } catch (error) { return next(error); }
};
