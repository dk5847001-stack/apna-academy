import mongoose from "mongoose";
import Module from "../models/Module.js";
import Video from "../models/Video.js";
import { AI_CONFIG } from "../config/ai.js";
import { askAI } from "./ai.service.js";
import { buildRagContext, retrieveCourseKnowledge } from "./ai.rag.service.js";
import { requireCourseAIEntitlement } from "./aiCourseAuthorization.service.js";

const assertId = (value, name) => {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error("Invalid " + name + ".");
    error.statusCode = 400;
    error.code = "AI_LEARNING_INVALID_ID";
    throw error;
  }
};

const fail = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  throw error;
};

const getScopedContext = async ({ userId, courseId, moduleId = null, videoId = null, query }) => {
  const entitlement = await requireCourseAIEntitlement(userId, courseId);

  if (!AI_CONFIG.ragEnabled) {
    fail(503, "AI_RAG_DISABLED", "Course-specific AI learning features are currently unavailable.");
  }

  let allowedModuleIds = entitlement.unlockedModuleIds.map(String);

  if (moduleId) {
    assertId(moduleId, "module id");
    const module = await Module.findOne({
      _id: moduleId,
      course: courseId,
      isPublished: true,
    }).select("_id order title").lean();

    if (!module) fail(404, "AI_LEARNING_MODULE_NOT_FOUND", "Published course module not found.");
    if (!allowedModuleIds.includes(String(module._id))) {
      fail(403, "AI_LEARNING_MODULE_LOCKED", "This module is still locked for your course access.");
    }
    allowedModuleIds = [module._id];
  }

  if (videoId) {
    assertId(videoId, "video id");
    const video = await Video.findOne({
      _id: videoId,
      course: courseId,
      isPublished: true,
    }).select("_id module title").lean();

    if (!video) fail(404, "AI_LEARNING_VIDEO_NOT_FOUND", "Published lesson not found.");
    if (!allowedModuleIds.includes(String(video.module))) {
      fail(403, "AI_LEARNING_VIDEO_LOCKED", "This lesson is still locked for your course access.");
    }
    allowedModuleIds = [video.module];
  }

  const chunks = await retrieveCourseKnowledge({
    courseId,
    query,
    allowedModuleIds,
  });

  if (!chunks.length) {
    fail(503, "AI_COURSE_KNOWLEDGE_NOT_AVAILABLE", "No authorized course knowledge is currently available for this request.");
  }

  return { entitlement, context: buildRagContext(chunks) };
};

const run = async ({ prompt, context, maxTokens = 1024, temperature = 0.2 }) => {
  const result = await askAI({
    messages: [{ role: "user", content: prompt }],
    maxTokens,
    temperature,
    ragContext: context,
  });
  const text = String(result.text || "").trim();
  if (!text) fail(502, "AI_EMPTY_PROVIDER_RESPONSE", "The AI returned an empty response.");
  return { text, model: result.model, provider: result.provider };
};

const parseJson = (value) => {
  const raw = String(value || "").trim();
  const fenced = raw.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);
  const candidate = fenced ? fenced[1] : raw;
  try {
    return JSON.parse(candidate);
  } catch {
    fail(502, "AI_INVALID_STRUCTURED_RESPONSE", "The AI returned an invalid structured learning response. Please retry.");
  }
};

export const explainCourseTopic = async ({ userId, courseId, moduleId, videoId, topic, level = "beginner" }) => {
  const cleanTopic = String(topic || "").trim().slice(0, 1200);
  if (!cleanTopic) fail(400, "AI_LEARNING_TOPIC_REQUIRED", "A topic is required.");

  const { context } = await getScopedContext({
    userId,
    courseId,
    moduleId,
    videoId,
    query: cleanTopic,
  });

  return run({
    context,
    maxTokens: 1200,
    prompt:
      "Teach this topic to a student using only the authorized course context as the primary source. Level: " + level + ".\n\nTopic: " + cleanTopic + "\n\nGive: 1) simple explanation, 2) key idea, 3) concrete example, 4) common mistake, 5) one short practice task. If the context does not contain enough information, clearly say what is missing instead of inventing course-specific facts.",
  });
};

export const summarizeCourseLesson = async ({ userId, courseId, moduleId, videoId }) => {
  if (!moduleId && !videoId) fail(400, "AI_LEARNING_SCOPE_REQUIRED", "A moduleId or videoId is required for a lesson summary.");

  const query = "Create a concise learning summary of this lesson, including concepts, definitions, examples, and important takeaways.";
  const { context } = await getScopedContext({ userId, courseId, moduleId, videoId, query });

  return run({
    context,
    maxTokens: 1000,
    prompt:
      "Summarize the authorized lesson material for the student. Do not add facts that are not supported by the provided course context. Use headings: Overview, Key Concepts, Important Details, Example/Pattern, Revision Checklist.",
  });
};

export const generatePracticeQuiz = async ({ userId, courseId, moduleId, videoId, count = 5, difficulty = "mixed" }) => {
  const safeCount = Math.min(Math.max(Number.parseInt(count, 10) || 5, 3), 10);
  const query = "Generate practice questions from the authorized course material with emphasis on understanding and application.";
  const { context } = await getScopedContext({ userId, courseId, moduleId, videoId, query });

  const result = await run({
    context,
    maxTokens: 1800,
    temperature: 0.15,
    prompt:
      "Generate exactly " + safeCount + " multiple-choice practice questions from the authorized course context. Difficulty: " + difficulty + ". Return ONLY valid JSON, no markdown, using this schema: {\"questions\":[{\"question\":\"string\",\"options\":[\"string\",\"string\",\"string\",\"string\"],\"correctOptionIndex\":0,\"explanation\":\"string\"}]}. Each question must have exactly 4 options, one correct answer, and a short explanation. Do not use information outside the supplied course context.",
  });

  const parsed = parseJson(result.text);
  if (!Array.isArray(parsed?.questions) || parsed.questions.length !== safeCount) {
    fail(502, "AI_INVALID_QUIZ_RESPONSE", "The AI returned an incomplete practice quiz. Please retry.");
  }

  const questions = parsed.questions.map((item) => {
    const options = Array.isArray(item.options) ? item.options.map((v) => String(v).trim()).filter(Boolean).slice(0, 4) : [];
    const correctOptionIndex = Number(item.correctOptionIndex);
    if (!String(item.question || "").trim() || options.length !== 4 || !Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
      fail(502, "AI_INVALID_QUIZ_RESPONSE", "The AI returned malformed practice questions. Please retry.");
    }
    return {
      question: String(item.question).trim().slice(0, 1200),
      options: options.map((v) => v.slice(0, 500)),
      correctOptionIndex,
      explanation: String(item.explanation || "").trim().slice(0, 1000),
    };
  });

  return { questions, model: result.model, provider: result.provider };
};

export const createStudyPlan = async ({ userId, courseId, goals, days = 7, dailyMinutes = 60 }) => {
  const safeDays = Math.min(Math.max(Number.parseInt(days, 10) || 7, 1), 30);
  const safeMinutes = Math.min(Math.max(Number.parseInt(dailyMinutes, 10) || 60, 15), 360);
  const cleanGoals = String(goals || "Complete the next course lessons and revise the important concepts.").trim().slice(0, 1500);

  const entitlement = await requireCourseAIEntitlement(userId, courseId);
  if (!AI_CONFIG.ragEnabled) fail(503, "AI_RAG_DISABLED", "Course-specific AI learning features are currently unavailable.");

  const context = buildRagContext(await retrieveCourseKnowledge({
    courseId,
    query: cleanGoals,
    allowedModuleIds: entitlement.unlockedModuleIds,
  }));

  if (!context) fail(503, "AI_COURSE_KNOWLEDGE_NOT_AVAILABLE", "No authorized course knowledge is currently available for this study plan.");

  return run({
    context,
    maxTokens: 1800,
    prompt:
      "Create a realistic " + safeDays + "-day study plan using only the currently authorized course material. Daily study time: " + safeMinutes + " minutes. Student goals: " + cleanGoals + ". Include day-by-day topics, active practice, revision, and a small checkpoint. Do not schedule locked modules and do not invent course content.",
  });
};

export const reviewCode = async ({ userId, courseId, moduleId, videoId, language = "javascript", code, question = "" }) => {
  const cleanCode = String(code || "").trim().slice(0, 10000);
  if (!cleanCode) fail(400, "AI_LEARNING_CODE_REQUIRED", "Code is required.");

  const query = question.trim() || "Explain the programming concepts, patterns, and expected implementation relevant to reviewing this code.";
  const { context } = await getScopedContext({ userId, courseId, moduleId, videoId, query });

  return run({
    context,
    maxTokens: 1600,
    temperature: 0.15,
    prompt:
      "Review the student's " + language + " code. Do not execute it. Use the authorized course context only for course-specific expectations.\n\nStudent question: " + (question.trim() || "Review this code and help me improve it.") + "\n\nCode:\n" + cleanCode + "\n\nReturn: correctness observations, bugs/edge cases, complexity when applicable, security/reliability concerns when applicable, and concrete improvement suggestions. Do not rewrite the entire solution unless necessary.",
  });
};
