import mongoose from "mongoose";

import Assessment from "../models/Assessment.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getActivePurchase = async (userId, courseId) => {
  const now = new Date();
  return Purchase.findOne({
    user: userId,
    course: courseId,
    paymentStatus: "paid",
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).lean();
};

const sanitizeAssessment = (assessment) => ({
  _id: assessment._id,
  course: assessment.course,
  title: assessment.title,
  description: assessment.description,
  passingScore: assessment.passingScore,
  maxAttempts: assessment.maxAttempts,
  isPublished: assessment.isPublished,
  questions: (assessment.questions || []).map((question) => ({
    _id: question._id,
    question: question.question,
    marks: question.marks,
    options: (question.options || []).map((option) => ({ _id: option._id, text: option.text })),
  })),
});

export const getStudentAssessment = async ({ userId, courseId }) => {
  if (!isValidObjectId(courseId)) {
    const error = new Error("Invalid course ID.");
    error.statusCode = 400;
    throw error;
  }

  const course = await Course.findOne({ _id: courseId, isPublished: true }).lean();
  if (!course) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  await getActivePurchase(userId, courseId).then((purchase) => {
    if (!purchase) {
      const error = new Error("Active course purchase is required.");
      error.statusCode = 403;
      throw error;
    }
  });

  const assessment = await Assessment.findOne({ course: courseId, isPublished: true }).lean();
  if (!assessment) return { available: false, assessment: null, attemptsUsed: 0, attemptsRemaining: 0 };

  const attemptsUsed = await AssessmentAttempt.countDocuments({ user: userId, assessment: assessment._id });
  return {
    available: assessment.questions.length > 0,
    assessment: sanitizeAssessment(assessment),
    attemptsUsed,
    attemptsRemaining: Math.max(assessment.maxAttempts - attemptsUsed, 0),
  };
};

export const submitStudentAssessment = async ({ userId, courseId, answers }) => {
  if (!isValidObjectId(courseId) || !Array.isArray(answers)) {
    const error = new Error("Invalid assessment submission.");
    error.statusCode = 400;
    throw error;
  }

  const course = await Course.findOne({ _id: courseId, isPublished: true }).lean();
  if (!course) {
    const error = new Error("Course not found.");
    error.statusCode = 404;
    throw error;
  }

  const purchase = await getActivePurchase(userId, courseId);
  if (!purchase) {
    const error = new Error("Active course purchase is required.");
    error.statusCode = 403;
    throw error;
  }

  const assessment = await Assessment.findOne({ course: courseId, isPublished: true }).lean();
  if (!assessment || !assessment.questions.length) {
    const error = new Error("Assessment is not available.");
    error.statusCode = 404;
    throw error;
  }

  const attemptsUsed = await AssessmentAttempt.countDocuments({ user: userId, assessment: assessment._id });
  if (attemptsUsed >= assessment.maxAttempts) {
    const error = new Error("Maximum assessment attempts reached.");
    error.statusCode = 429;
    throw error;
  }

  const answerMap = new Map();
  for (const answer of answers) {
    if (isValidObjectId(answer?.questionId)) answerMap.set(String(answer.questionId), String(answer.selectedOptionId || ""));
  }

  let totalMarks = 0;
  let earnedMarks = 0;
  const persistedAnswers = [];

  for (const question of assessment.questions) {
    totalMarks += question.marks;
    const selected = answerMap.get(String(question._id)) || null;
    if (selected && selected === String(question.correctOptionId)) earnedMarks += question.marks;
    persistedAnswers.push({ questionId: question._id, selectedOptionId: isValidObjectId(selected) ? selected : null });
  }

  const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 10000) / 100 : 0;
  const passed = score >= assessment.passingScore;

  const attempt = await AssessmentAttempt.create({ user: userId, course: courseId, assessment: assessment._id, answers: persistedAnswers, score, passed });

  return {
    attemptId: attempt._id,
    score,
    passed,
    passingScore: assessment.passingScore,
    attemptsUsed: attemptsUsed + 1,
    attemptsRemaining: Math.max(assessment.maxAttempts - attemptsUsed - 1, 0),
  };
};
