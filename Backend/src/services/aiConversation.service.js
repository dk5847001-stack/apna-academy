import mongoose from "mongoose";
import AIConversation from "../models/AIConversation.js";
import AIMessage from "../models/AIMessage.js";
import { AI_CONFIG } from "../config/ai.js";
import { askAI } from "./ai.service.js";

const MAX_TITLE_LENGTH = 120;
const MAX_STORED_MESSAGES = 200;
const MAX_HISTORY_MESSAGES = 20;
const MAX_STORED_CONTENT_CHARS = 12000;

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const assertConversationId = (conversationId) => {
  if (!isValidObjectId(conversationId)) {
    const error = new Error("Invalid conversation id.");
    error.statusCode = 400;
    error.code = "AI_INVALID_CONVERSATION_ID";
    throw error;
  }
};

const normalizeTitle = (value) => {
  const title = String(value || "").replace(/\s+/g, " ").trim();
  return title.slice(0, MAX_TITLE_LENGTH) || "New AI chat";
};

const assertUserId = (userId) => {
  if (!isValidObjectId(userId)) {
    const error = new Error("Authenticated user is required.");
    error.statusCode = 401;
    error.code = "AI_AUTHENTICATION_REQUIRED";
    throw error;
  }
};

const getOwnedConversation = async (userId, conversationId, { includeArchived = false } = {}) => {
  assertUserId(userId);
  assertConversationId(conversationId);
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

export const listConversations = async ({ userId, limit = 30 }) => {
  assertUserId(userId);
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 30, 1), 50);
  return AIConversation.find({ user: userId, archivedAt: null })
    .sort({ updatedAt: -1 })
    .limit(safeLimit)
    .select("_id title messageCount lastMessageAt createdAt updatedAt")
    .lean();
};

export const createConversation = async ({ userId, title }) => {
  assertUserId(userId);
  return AIConversation.create({
    user: userId,
    title: normalizeTitle(title),
  });
};

export const getConversationMessages = async ({ userId, conversationId, limit = MAX_STORED_MESSAGES }) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || MAX_STORED_MESSAGES, 1), MAX_STORED_MESSAGES);
  const messages = await AIMessage.find({ conversation: conversation._id, user: userId })
    .sort({ sequence: -1 })
    .limit(safeLimit)
    .lean();
  return { conversation, messages: messages.reverse() };
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

export const addMessageAndGenerateReply = async ({ userId, conversationId, content, maxTokens, temperature }) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  const userContent = validateUserMessage(content);

  const currentCount = await AIMessage.countDocuments({ conversation: conversation._id, user: userId });
  if (currentCount >= MAX_STORED_MESSAGES) {
    const error = new Error("This conversation has reached its message limit. Start a new chat.");
    error.statusCode = 409;
    error.code = "AI_CONVERSATION_MESSAGE_LIMIT";
    throw error;
  }

  const recent = await AIMessage.find({ conversation: conversation._id, user: userId })
    .sort({ sequence: -1 })
    .limit(MAX_HISTORY_MESSAGES - 1)
    .select("role content sequence")
    .lean();

  const history = recent.reverse().map(({ role, content: messageContent }) => ({
    role,
    content: messageContent,
  }));

  const nextSequence = currentCount;
  const userMessage = await AIMessage.create({
    conversation: conversation._id,
    user: userId,
    role: "user",
    content: userContent,
    sequence: nextSequence,
  });

  try {
    const result = await askAI({
      messages: [...history, { role: "user", content: userContent }],
      maxTokens,
      temperature,
    });

    const assistantMessage = await AIMessage.create({
      conversation: conversation._id,
      user: userId,
      role: "assistant",
      content: String(result.text || "").trim().slice(0, MAX_STORED_CONTENT_CHARS),
      sequence: nextSequence + 1,
      model: result.model || "",
    });

    const messageCount = currentCount + 2;
    const title = currentCount === 0 ? normalizeTitle(userContent) : conversation.title;
    const updated = await AIConversation.findOneAndUpdate(
      { _id: conversation._id, user: userId, archivedAt: null },
      {
        $set: {
          title,
          messageCount,
          lastMessageAt: assistantMessage.createdAt,
        },
      },
      { new: true }
    ).select("_id title messageCount lastMessageAt createdAt updatedAt").lean();

    return {
      conversation: updated,
      userMessage,
      assistantMessage,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    await AIMessage.deleteOne({ _id: userMessage._id, user: userId });
    throw error;
  }
};

export const renameConversation = async ({ userId, conversationId, title }) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  conversation.title = normalizeTitle(title);
  await conversation.save();
  return conversation;
};

export const archiveConversation = async ({ userId, conversationId }) => {
  const conversation = await getOwnedConversation(userId, conversationId);
  conversation.archivedAt = new Date();
  await conversation.save();
  return { id: conversation._id, archived: true };
};
