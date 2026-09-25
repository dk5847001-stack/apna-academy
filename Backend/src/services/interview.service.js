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

const publicQuestion = (item) => ({
  id: String(item.id || "").slice(0, 80),
  category: String(item.category || "Interview").slice(0, 100),
  question: String(item.question || "").trim().slice(0, 2000),
  hint: String(item.hint || "").trim().slice(0, 500),
  isFollowUp: Boolean(item.isFollowUp),
  parentQuestionId: String(item.parentQuestionId || "").slice(0, 80),
});

export async function createInterview({ userId, setup }) {
  const clean = cleanSetup(setup);
  const questions = (await generateOpeningQuestions(clean)).map((item) => publicQuestion(item));
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
  const evaluation = await evaluateAnswer({
    setup: session.setup,
    question,
    answer: cleanAnswer,
    previousAnswers: previous,
    questionIndex: session.answers.length,
    totalQuestions: session.questions.length,
  });

  session.answers = session.answers.filter((item) => item.questionId !== questionId);
  session.answers.push({
    questionId,
    question: question.question,
    category: question.category,
    answer: cleanAnswer,
    score: evaluation.score,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
  });

  let followUpQuestion = null;
  const answeredPlannedCount = session.answers.filter((item) => {
    const source = session.questions.find((candidate) => candidate.id === item.questionId);
    return source && !source.isFollowUp;
  }).length;

  const existingFollowUpCount = session.questions.filter((item) => item.isFollowUp).length;
  if (!question.isFollowUp && evaluation.followUpQuestion && answeredPlannedCount <= session.setup.questionCount && existingFollowUpCount < 5) {
    const followUpId = question.id + "-followup";
    const exists = session.questions.some((item) => item.id === followUpId);
    if (!exists) {
      followUpQuestion = publicQuestion({
        id: followUpId,
        category: evaluation.nextCategory || question.category,
        question: evaluation.followUpQuestion,
        hint: "Use the previous answer as context and explain your reasoning.",
        isFollowUp: true,
        parentQuestionId: question.id,
      });
      session.questions.push(followUpQuestion);
    }
  }

  const answeredPlanned = session.answers.filter((item) => {
    const source = session.questions.find((candidate) => candidate.id === item.questionId);
    return source && !source.isFollowUp;
  }).length;
  const unansweredFollowUps = session.questions.filter((candidate) => candidate.isFollowUp && !session.answers.some((item) => item.questionId === candidate.id)).length;
  const isLast = answeredPlanned >= session.setup.questionCount && unansweredFollowUps === 0;

  if (isLast) {
    session.status = "completed";
    session.completedAt = new Date();
    session.result = await buildFinalReport({
      setup: session.setup,
      answers: session.answers.map((item) => item.toObject ? item.toObject() : item),
    });
  }

  await session.save();
  return { session, evaluation, completed: isLast, followUpQuestion };
}

export async function getInterviewResult({ userId, sessionId }) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId }).lean();
  if (!session) throw Object.assign(new Error("Interview session not found."), { statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
  return session;
}

export async function listInterviewHistory({ userId, limit = 20 }) {
  return InterviewSession.find({ userId, status: { $in: ["completed", "expired"] } })
    .sort({ createdAt: -1 })
    .limit(Math.min(50, Math.max(1, Number(limit) || 20)))
    .lean();
}

export async function completeInterview({ userId, sessionId }) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId, status: "active" });
  if (!session) throw Object.assign(new Error("Interview session not found or already completed."), { statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
  if (!session.answers.length) {
    session.status = "expired";
    session.completedAt = new Date();
    await session.save();
    return session;
  }
  session.status = "completed";
  session.completedAt = new Date();
  session.result = await buildFinalReport({ setup: session.setup, answers: session.answers.map((item) => item.toObject ? item.toObject() : item) });
  await session.save();
  return session;
}
