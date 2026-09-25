import {
  createStudyPlan,
  explainCourseTopic,
  generatePracticeQuiz,
  reviewCode,
  summarizeCourseLesson,
} from "../services/aiLearning.service.js";

const getUserId = (req) => req.user?.userId;
const getCourseId = (req) => req.params.courseId;

export const explainTopic = async (req, res, next) => {
  try {
    const data = await explainCourseTopic({
      userId: getUserId(req), courseId: getCourseId(req), moduleId: req.body?.moduleId,
      videoId: req.body?.videoId, topic: req.body?.topic, level: req.body?.level,
    });
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const summarizeLesson = async (req, res, next) => {
  try {
    const data = await summarizeCourseLesson({
      userId: getUserId(req), courseId: getCourseId(req), moduleId: req.body?.moduleId, videoId: req.body?.videoId,
    });
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const practiceQuiz = async (req, res, next) => {
  try {
    const data = await generatePracticeQuiz({
      userId: getUserId(req), courseId: getCourseId(req), moduleId: req.body?.moduleId,
      videoId: req.body?.videoId, count: req.body?.count, difficulty: req.body?.difficulty,
    });
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const studyPlan = async (req, res, next) => {
  try {
    const data = await createStudyPlan({
      userId: getUserId(req), courseId: getCourseId(req), goals: req.body?.goals,
      days: req.body?.days, dailyMinutes: req.body?.dailyMinutes,
    });
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const codeReview = async (req, res, next) => {
  try {
    const data = await reviewCode({
      userId: getUserId(req), courseId: getCourseId(req), moduleId: req.body?.moduleId,
      videoId: req.body?.videoId, language: req.body?.language, code: req.body?.code, question: req.body?.question,
    });
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
