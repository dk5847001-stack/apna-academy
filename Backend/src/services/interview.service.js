import InterviewSession from "../models/InterviewSession.js";
import { buildFinalReport, evaluateAnswer, generateOpeningQuestions } from "./groqInterview.service.js";

const allowedTypes = new Set(["technical", "dsa", "behavioral"]);
const allowedDifficulties = new Set(["easy", "medium", "hard"]);\nconst MAX_ROLE_CHARS = Math.max(20, Math.min(120, Number(process.env.INTERVIEW_MAX_ROLE_CHARS || 80)));\nconst MAX_EXPERIENCE_CHARS = Math.max(20, Math.min(80, Number(process.env.INTERVIEW_MAX_EXPERIENCE_CHARS || 50)));\nconst MAX_QUESTIONS = Math.max(1, Math.min(30, Number(process.env.INTERVIEW_MAX_QUESTIONS || 30)));\nconst MAX_FOLLOWUPS = Math.max(0, Math.min(10, Number(process.env.INTERVIEW_MAX_FOLLOWUPS || 5)));

const cleanSetup = (input = {}) => {
  const role = String(input.role || "").trim().slice(0, MAX_ROLE_CHARS);
  const interviewType = String(input.interviewType || "technical");
  const experience = String(input.experience || "fresher").trim().slice(0, MAX_EXPERIENCE_CHARS);
  const difficulty = String(input.difficulty || "medium");
  const durationMinutes = Math.min(180, Math.max(5, Number(input.durationMinutes) || 30));
  const questionCount = Math.min(MAX_QUESTIONS, Math.max(1, Number(input.questionCount) || 10));

  if (role.length < 2) {
    throw Object.assign(new Error("A valid target role is required."), {
      statusCode: 400,
      code: "INVALID_ROLE",
    });
  }

  if (!allowedTypes.has(interviewType) || !allowedDifficulties.has(difficulty)) {
    throw Object.assign(new Error("Invalid interview configuration."), {
      statusCode: 400,
      code: "INVALID_SETUP",
    });
  }

  return {
    role,
    interviewType,
    experience,
    difficulty,
    durationMinutes,
    questionCount,
  };
};

const publicQuestion = (item) => ({
  id: String(item.id || "").slice(0, 80),
  category: String(item.category || "Interview").slice(0, 100),
  question: String(item.question || "").trim().slice(0, 2000),
  hint: String(item.hint || "").trim().slice(0, 500),
  isFollowUp: Boolean(item.isFollowUp),
  parentQuestionId: String(item.parentQuestionId || "").slice(0, 80),
});

const toPlain = (item) => (item?.toObject ? item.toObject() : item);

export async function createInterview({ userId, setup }) {
  const clean = cleanSetup(setup);
  const questions = (await generateOpeningQuestions(clean)).map(publicQuestion);

  return InterviewSession.create({
    userId,
    setup: clean,
    questions,
    status: "active",
  });
}

export async function submitInterviewAnswer({ userId, sessionId, questionId, answer }) {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    userId,
    status: "active",
  });

  if (!session) {
    throw Object.assign(new Error("Interview session not found or no longer active."), {
      statusCode: 404,
      code: "INTERVIEW_NOT_FOUND",
    });
  }

  const question = session.questions.find((item) => item.id === questionId);
  if (!question) {
    throw Object.assign(new Error("Interview question not found."), {
      statusCode: 404,
      code: "QUESTION_NOT_FOUND",
    });
  }

  const cleanAnswer = String(answer || "").trim().slice(0, 10000);
  if (cleanAnswer.length < 2) {
    throw Object.assign(new Error("Please provide an answer before submitting."), {
      statusCode: 400,
      code: "ANSWER_REQUIRED",
    });
  }

  const previous = session.answers.map(toPlain);
  const questionIndex = session.questions.findIndex((item) => item.id === questionId);

  const evaluation = await evaluateAnswer({
    setup: session.setup,
    question,
    answer: cleanAnswer,
    previousAnswers: previous,
    questionIndex: Math.max(0, questionIndex),
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

  if (
    !question.isFollowUp &&
    evaluation.followUpQuestion &&
    answeredPlannedCount <= session.setup.questionCount &&
    existingFollowUpCount < MAX_FOLLOWUPS
  ) {
    const followUpId = `${question.id}-followup`;
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

      const sourceIndex = session.questions.findIndex((item) => item.id === question.id);
      session.questions.splice(Math.max(0, sourceIndex + 1), 0, followUpQuestion);
    }
  }

  const answeredPlanned = session.answers.filter((item) => {
    const source = session.questions.find((candidate) => candidate.id === item.questionId);
    return source && !source.isFollowUp;
  }).length;

  const unansweredFollowUps = session.questions.filter(
    (candidate) =>
      candidate.isFollowUp &&
      !session.answers.some((item) => item.questionId === candidate.id)
  ).length;

  const isLast =
    answeredPlanned >= session.setup.questionCount && unansweredFollowUps === 0;

  if (isLast) {
    session.status = "completed";
    session.completedAt = new Date();
    session.result = await buildFinalReport({
      setup: session.setup,
      answers: session.answers.map(toPlain),
    });
  }

  await session.save();

  const nextQuestionIndex = followUpQuestion
    ? session.questions.findIndex((item) => item.id === followUpQuestion.id)
    : session.questions.findIndex(
        (item, index) =>
          index > questionIndex &&
          !session.answers.some((answerItem) => answerItem.questionId === item.id)
      );

  const nextQuestion =
    nextQuestionIndex >= 0 ? publicQuestion(session.questions[nextQuestionIndex]) : null;

  return {
    session,
    evaluation,
    completed: isLast,
    followUpQuestion,
    nextQuestion,
  };
}

export async function getInterviewResult({ userId, sessionId }) {
  const session = await InterviewSession.findOne({ _id: sessionId, userId }).lean();

  if (!session) {
    throw Object.assign(new Error("Interview session not found."), {
      statusCode: 404,
      code: "INTERVIEW_NOT_FOUND",
    });
  }

  return session;
}

export async function listInterviewHistory({ userId, limit = 20 }) {
  return InterviewSession.find({
    userId,
    status: { $in: ["completed", "expired"] },
  })
    .sort({ createdAt: -1 })
    .limit(Math.min(50, Math.max(1, Number(limit) || 20)))
    .lean();
}

export async function completeInterview({ userId, sessionId }) {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    userId,
    status: "active",
  });

  if (!session) {
    throw Object.assign(new Error("Interview session not found or already completed."), {
      statusCode: 404,
      code: "INTERVIEW_NOT_FOUND",
    });
  }

  if (!session.answers.length) {
    session.status = "expired";
    session.completedAt = new Date();
    await session.save();
    return session;
  }

  session.status = "completed";
  session.completedAt = new Date();
  session.result = await buildFinalReport({
    setup: session.setup,
    answers: session.answers.map(toPlain),
  });

  await session.save();
  return session;
}
