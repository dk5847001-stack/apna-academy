import InterviewSession from "../models/InterviewSession.js";
import { buildFinalReport, evaluateAnswer, generateOpeningQuestions } from "./nvidiaInterview.service.js";

const allowedTypes = new Set(["technical", "dsa", "behavioral"]);
const allowedDifficulties = new Set(["easy", "medium", "hard"]);

const cleanSetup = (input = {}) => {
  const role = String(input.role || "").trim().slice(0, 80);
  const interviewType = String(input.interviewType || "technical");
  const experience = String(input.experience || "fresher").trim().slice(0, 50);
  const difficulty = String(input.difficulty || "medium");
  const durationMinutes = Math.min(180, Math.max(5, Number(input.durationMinutes) || 30));
  const questionCount = Math.min(30, Math.max(1, Number(input.questionCount) || 10));
  if (role.length < 2) throw Object.assign(new Error("A valid target role is required."), { statusCode: 400, code: "INVALID_ROLE" });
  if (!allowedTypes.has(interviewType) || !allowedDifficulties.has(difficulty)) throw Object.assign(new Error("Invalid interview configuration."), { statusCode: 400, code: "INVALID_SETUP" });
  return { role, interviewType, experience, difficulty, durationMinutes, questionCount };
};

export async function createInterview({ userId, setup }) {
  const clean = cleanSetup(setup);
  const questions = await generateOpeningQuestions(clean);
  return InterviewSession.create({ userId, setup: clean, questions, status: "active" });
}

export async function submitInterviewAnswer({ userId, sessionId, questionId, answer }) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId, status: "active" });
  if (!session) throw Object.assign(new Error("Interview session not found or no longer active."), { statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
  const question = session.questions.find((item) => item.id === questionId);
  if (!question) throw Object.assign(new Error("Interview question not found."), { statusCode: 404, code: "QUESTION_NOT_FOUND" });
  const cleanAnswer = String(answer || "").trim().slice(0, 10000);
  if (cleanAnswer.length < 2) throw Object.assign(new Error("Please provide an answer before submitting."), { statusCode: 400, code: "ANSWER_REQUIRED" });
  const previous = session.answers.map((item) => item.toObject ? item.toObject() : item);
  const evaluation = await evaluateAnswer({ setup: session.setup, question, answer: cleanAnswer, previousAnswers: previous, questionIndex: session.answers.length, totalQuestions: session.questions.length });
  session.answers = session.answers.filter((item) => item.questionId !== questionId);
  session.answers.push({ questionId, question: question.question, category: question.category, answer: cleanAnswer, score: evaluation.score, feedback: evaluation.feedback, strengths: evaluation.strengths, improvements: evaluation.improvements });
  const isLast = session.answers.length >= session.questions.length;
  if (isLast) {
    session.status = "completed";
    session.completedAt = new Date();
    session.result = await buildFinalReport({ setup: session.setup, answers: session.answers.map((item) => item.toObject ? item.toObject() : item) });
  }
  await session.save();
  return { session, evaluation, completed: isLast };
}

export async function getInterviewResult({ userId, sessionId }) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId }).lean();
  if (!session) throw Object.assign(new Error("Interview session not found."), { statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
  return session;
}

export async function listInterviewHistory({ userId, limit = 20 }) {
  return InterviewSession.find({ userId, status: { $in: ["completed", "expired"] } }).sort({ createdAt: -1 }).limit(Math.min(50, Math.max(1, limit))).lean();
}
