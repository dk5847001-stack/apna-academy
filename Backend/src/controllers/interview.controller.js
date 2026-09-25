import { completeInterview, createInterview, getInterviewResult, listInterviewHistory, submitInterviewAnswer } from "../services/interview.service.js";

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export const createInterviewController = asyncHandler(async (req, res) => {
  const session = await createInterview({ userId: req.user.userId, setup: req.body });
  return res.status(201).json({ success: true, data: { sessionId: session._id, setup: session.setup, questions: session.questions } });
});

export const submitInterviewAnswerController = asyncHandler(async (req, res) => {
  const session = await submitInterviewAnswer({ userId: req.user.userId, sessionId: req.params.sessionId, questionId: req.body?.questionId, answer: req.body?.answer });
  return res.status(200).json({ success: true, data: { sessionId: session.session._id, evaluation: session.evaluation, completed: session.completed, result: session.completed ? session.session.result : null } });
});

export const completeInterviewController = asyncHandler(async (req, res) => {
  const session = await completeInterview({ userId: req.user.userId, sessionId: req.params.sessionId });
  return res.status(200).json({ success: true, data: { sessionId: session._id, result: session.result, status: session.status } });
});

export const getInterviewResultController = asyncHandler(async (req, res) => {
  const session = await getInterviewResult({ userId: req.user.userId, sessionId: req.params.sessionId });
  return res.status(200).json({ success: true, data: session });
});

export const getInterviewHistoryController = asyncHandler(async (req, res) => {
  const sessions = await listInterviewHistory({ userId: req.user.userId, limit: req.query.limit });
  return res.status(200).json({ success: true, data: sessions });
});
