import mongoose from "mongoose";
import Assessment from "../models/Assessment.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";
import Course from "../models/Course.js";

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeQuestions = (questions = []) => questions.map((q) => {
  const options = (q.options || []).map((o) => ({
    _id: validId(o._id) ? o._id : new mongoose.Types.ObjectId(),
    text: String(o.text || "").trim(),
  }));
  if (!q.question?.trim() || options.length < 2 || options.length > 6) throw fail("Each question needs text and 2 to 6 options.");
  const correct = String(q.correctOptionId || "");
  if (!options.some((o) => String(o._id) === correct)) throw fail("Correct option must belong to the question options.");
  return { _id: validId(q._id) ? q._id : new mongoose.Types.ObjectId(), question: q.question.trim(), options, correctOptionId: correct, marks: Math.max(1, Math.min(100, Number(q.marks) || 1)) };
});

export const listAdminAssessments = async () => {
  const assessments = await Assessment.find({}).populate("course", "title slug isPublished").sort({ updatedAt: -1 }).lean();
  const ids = assessments.map((a) => a._id);
  const attempts = ids.length ? await AssessmentAttempt.aggregate([{ $match: { assessment: { $in: ids } } }, { $group: { _id: "$assessment", attempts: { $sum: 1 }, passed: { $sum: { $cond: ["$passed", 1, 0] } }, avgScore: { $avg: "$score" } } }]) : [];
  const stats = new Map(attempts.map((x) => [String(x._id), x]));
  return assessments.map((a) => ({ ...a, questionCount: a.questions?.length || 0, stats: stats.get(String(a._id)) || { attempts: 0, passed: 0, avgScore: 0 } }));
};

export const getAdminAssessment = async (assessmentId) => {
  if (!validId(assessmentId)) throw fail("Invalid assessment ID.");
  const assessment = await Assessment.findById(assessmentId).populate("course", "title slug").lean();
  if (!assessment) throw fail("Assessment not found.", 404);
  return assessment;
};

export const createAdminAssessment = async ({ courseId, title, description, passingScore, maxAttempts, questions, isPublished }) => {
  if (!validId(courseId)) throw fail("Invalid course ID.");
  const course = await Course.findById(courseId).lean();
  if (!course) throw fail("Course not found.", 404);
  const existing = await Assessment.findOne({ course: courseId }).lean();
  if (existing) throw fail("An assessment already exists for this course.", 409);
  return Assessment.create({ course: courseId, title: String(title || "").trim(), description: String(description || "").trim(), passingScore: Math.max(1, Math.min(100, Number(passingScore) || 60)), maxAttempts: Math.max(1, Math.min(20, Number(maxAttempts) || 3)), questions: normalizeQuestions(questions), isPublished: Boolean(isPublished) });
};

export const updateAdminAssessment = async ({ assessmentId, title, description, passingScore, maxAttempts, questions, isPublished }) => {
  if (!validId(assessmentId)) throw fail("Invalid assessment ID.");
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw fail("Assessment not found.", 404);
  if (title !== undefined) assessment.title = String(title).trim();
  if (description !== undefined) assessment.description = String(description).trim();
  if (passingScore !== undefined) assessment.passingScore = Math.max(1, Math.min(100, Number(passingScore) || 60));
  if (maxAttempts !== undefined) assessment.maxAttempts = Math.max(1, Math.min(20, Number(maxAttempts) || 3));
  if (questions !== undefined) assessment.questions = normalizeQuestions(questions);
  if (isPublished !== undefined) assessment.isPublished = Boolean(isPublished);
  await assessment.save();
  return assessment.toObject();
};

export const deleteAdminAssessment = async (assessmentId) => {
  if (!validId(assessmentId)) throw fail("Invalid assessment ID.");
  const assessment = await Assessment.findByIdAndDelete(assessmentId);
  if (!assessment) throw fail("Assessment not found.", 404);
  await AssessmentAttempt.deleteMany({ assessment: assessmentId });
  return { deleted: true, assessmentId };
};
