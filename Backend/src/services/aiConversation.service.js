import mongoose from "mongoose";
import Course from "../models/Course.js";
import AIConversation from "../models/AIConversation.js";
import AIMessage from "../models/AIMessage.js";
import { AI_CONFIG } from "../config/ai.js";
import { askAI } from "./ai.service.js";
import {
  requireCourseAIEntitlement,
  requireConversationCourseAIEntitlement,
} from "./aiCourseAuthorization.service.js";
import { retrieveCourseKnowledge, buildRagContext } from "./ai.rag.service.js";

const MAX_TITLE_LENGTH = 120;
const MAX_STORED_MESSAGES = 200;
const MAX_HISTORY_MESSAGES = 20;
const MAX_STORED_CONTENT_CHARS = 12000;

const assertObjectId = (value, name = "id") => {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${name}.`);
    error.statusCode = 400;
    error.code = "AI_RAG_INVALID_ID";
    throw error;
  }
};

const normalizeTitle = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TITLE_LENGTH) || "New AI chat";

const assertUserId = (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    const error = new Error("Authenticated user is required.");
    error.statusCode = 401;
    error.code = "AI_AUTHENTICATION_REQUIRED";
    throw error;
  }
};

const getOwnedConversation = async (
  userId,
  conversationId,
  { includeArchived = false } = {}
) => {
  assertUserId(userId);
  assertObjectId(conversationId, "conversation id");

  const filter = { _id: conversationId, user: userId };
  if (!includeArchived) filter.archivedAt = null;

  const conversation = await AIConversation.findOne(filter);
  if (!conversation) {
    const error = new Error("AI conversation was not found.");
    error.statusCode = 404;
    error.code = "AI_CONVERSATION_NOT_FOUND";
    throw error;
  }

  return conversation;
};

export const listConversations = async ({
  userId,
  limit = 30,
  courseId = null,
}) => {
  assertUserId(userId);

  const safeLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || 30, 1),
    50
  );
  const filter = { user: userId, archivedAt: null };

  if (courseId) {
    assertObjectId(courseId, "course id");
    await requireCourseAIEntitlement(userId, courseId);
    filter.course = courseId;
  }

  return AIConversation.find(filter)
    .sort({ updatedAt: -1 })
    .limit(safeLimit)
    .select("_id course title messageCount lastMessageAt createdAt updatedAt")
    .lean();
};

export const createConversation = async ({
  userId,
  title,
  courseId = null,
}) => {
  assertUserId(userId);

  let course = null;

  if (courseId) {
    assertObjectId(courseId, "course id");

    course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    })
      .select("_id title")
      .lean();

    if (!course) {
      const error = new Error("Published course not found.");
      error.statusCode = 404;
      error.code = "AI_COURSE_NOT_FOUND";
      throw error;
    }

    await requireCourseAIEntitlement(userId, course._id);

    if (!AI_CONFIG.ragEnabled) {
      const error = new Error("Course-specific AI is currently unavailable.");
      error.statusCode = 503;
      error.code = "AI_RAG_DISABLED";
      throw error;
    }
  }

  return AIConversation.create({
    user: userId,
    course: course?._id || null,
    title: normalizeTitle(title),
  });
};

export const getConversationMessages = async ({
  userId,
  conversationId,
  limit = MAX_STORED_MESSAGES,
}) => {
  const conversation = await getOwnedConversation(userId, conversationId);

  // A course conversation contains private learning material. Re-check the
  // entitlement before returning its history, not only before generating AI.
  await requireConversationCourseAIEntitlement(userId, conversation);

  const safeLimit = Math.min(
    Math.max(Number.parseInt(limit, 10) || MAX_STORED_MESSAGES, 1),
    MAX_STORED_MESSAGES
  );

  const messages = await AIMessage.find({
    conversation: conversation._id,
    user: userId,
  })
    .sort({ sequence: -1 })
    .limit(safeLimit)
    .lean();

  return {
    conversation: {
      _id: conversation._id,
      course: conversation.course,
      title: conversation.title,
      messageCount: conversation.messageCount,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    },
    messages: messages.reverse(),
  };
};

const validateUserMessage = (content) => {
  if (typeof content !== "string" || !content.trim()) {
    const error = new Error("Message content is required.");
    error.statusCode = 400;
    error.code = "AI_MESSAGE_REQUIRED";
    throw error;
  }

  const value = content.trim();

  if (value.length > AI_CONFIG.maxInputChars) {
    const error = new Error("Message is too large.");
    error.statusCode = 413;
    error.code = "AI_MESSAGE_TOO_LARGE";
    throw error;
  }

  return value;
};

const rollbackReservedMessages = async (
  conversationId,
  userId,
  reservedCount
) => {
  await AIConversation.updateOne(
    {
      _id: conversationId,
      user: userId,
      messageCount: { $gte: reservedCount },
    },
    { $inc: { messageCount: -reservedCount } }
  );
};

export const addMessageAndGenerateReply = async ({
  userId,
  conversationId,
  content,
  maxTokens,
  temperature,
}) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  const userContent = validateUserMessage(content);

  let ragContext = "";

  if (conversation.course) {
    const entitlement = await requireCourseAIEntitlement(
      userId,
      conversation.course
    );

    if (!AI_CONFIG.ragEnabled) {
      const error = new Error("Course-specific AI is currently unavailable.");
      error.statusCode = 503;
      error.code = "AI_RAG_DISABLED";
      throw error;
    }

    const chunks = await retrieveCourseKnowledge({
      courseId: conversation.course,
      query: userContent,
      allowedModuleIds: entitlement.unlockedModuleIds,
      metadata: { userId, courseId: conversation.course, conversationId: conversation._id, audience: "user" },
    });

    if (!chunks.length) {
      const error = new Error(
        "No authorized course knowledge is currently available for this question."
      );
      error.statusCode = 503;
      error.code = "AI_COURSE_KNOWLEDGE_NOT_AVAILABLE";
      throw error;
    }

    ragContext = buildRagContext(chunks);
  }

  const currentCount = await AIMessage.countDocuments({
    conversation: conversation._id,
    user: userId,
  });

  if (currentCount >= MAX_STORED_MESSAGES - 1) {
    const error = new Error(
      "This conversation has reached its message limit. Start a new chat."
    );
    error.statusCode = 409;
    error.code = "AI_CONVERSATION_MESSAGE_LIMIT";
    throw error;
  }

  const recent = await AIMessage.find({
    conversation: conversation._id,
    user: userId,
  })
    .sort({ sequence: -1 })
    .limit(MAX_HISTORY_MESSAGES - 1)
    .select("role content sequence")
    .lean();

  const history = recent.reverse().map(({ role, content: messageContent }) => ({
    role,
    content: messageContent,
  }));

  const reserved = await AIConversation.findOneAndUpdate(
    {
      _id: conversation._id,
      user: userId,
      archivedAt: null,
      messageCount: currentCount,
    },
    { $inc: { messageCount: 2 } },
    { new: true }
  );

  if (!reserved) {
    const error = new Error(
      "This conversation changed while processing your message. Please retry."
    );
    error.statusCode = 409;
    error.code = "AI_CONVERSATION_CONFLICT";
    throw error;
  }

  const nextSequence = currentCount;
  let userMessage;

  try {
    userMessage = await AIMessage.create({
      conversation: conversation._id,
      user: userId,
      role: "user",
      content: userContent,
      sequence: nextSequence,
    });

    const result = await askAI({
      messages: [...history, { role: "user", content: userContent }],
      maxTokens,
      temperature,
      ragContext,
      metadata: {
        userId,
        courseId: conversation.course,
        conversationId: conversation._id,
        feature: conversation.course ? "course-chat" : "chat",
        audience: "user",
      },
    });

    const assistantContent = String(result.text || "")
      .trim()
      .slice(0, MAX_STORED_CONTENT_CHARS);

    if (!assistantContent) {
      const error = new Error("The AI returned an empty response.");
      error.statusCode = 502;
      error.code = "AI_EMPTY_PROVIDER_RESPONSE";
      throw error;
    }

    const assistantMessage = await AIMessage.create({
      conversation: conversation._id,
      user: userId,
      role: "assistant",
      content: assistantContent,
      sequence: nextSequence + 1,
      model: result.model || "",
    });

    const title =
      currentCount === 0 ? normalizeTitle(userContent) : conversation.title;

    const updated = await AIConversation.findOneAndUpdate(
      {
        _id: conversation._id,
        user: userId,
        archivedAt: null,
        messageCount: currentCount + 2,
      },
      {
        $set: {
          title,
          lastMessageAt: assistantMessage.createdAt,
        },
      },
      { new: true }
    )
      .select("_id course title messageCount lastMessageAt createdAt updatedAt")
      .lean();

    if (!updated) {
      const error = new Error("Unable to finalize the AI conversation.");
      error.statusCode = 409;
      error.code = "AI_CONVERSATION_FINALIZE_FAILED";
      throw error;
    }

    return {
      conversation: updated,
      userMessage,
      assistantMessage,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    if (userMessage?._id) {
      await AIMessage.deleteOne({
        _id: userMessage._id,
        conversation: conversation._id,
        user: userId,
      });
    }

    await AIMessage.deleteOne({
      conversation: conversation._id,
      user: userId,
      sequence: nextSequence + 1,
    });

    await rollbackReservedMessages(conversation._id, userId, 2);
    throw error;
  }
};

export const renameConversation = async ({
  userId,
  conversationId,
  title,
}) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  await requireConversationCourseAIEntitlement(userId, conversation);
  conversation.title = normalizeTitle(title);
  await conversation.save();

  return {
    _id: conversation._id,
    course: conversation.course,
    title: conversation.title,
    messageCount: conversation.messageCount,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

export const archiveConversation = async ({ userId, conversationId }) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  conversation.archivedAt = new Date();
  await conversation.save();

  return {
    id: conversation._id,
    archived: true,
  };
};
