import { AI_CONFIG } from "../config/ai.js";
import { generateChatCompletion } from "./nvidia.service.js";

const SYSTEM_PROMPT = "You are ApnaAcademy AI, a helpful learning assistant for students.\n\n" +
  "Rules:\n" +
  "- Give accurate, practical, educational answers.\n" +
  "- Prefer clear explanations and examples.\n" +
  "- For programming questions, use correct syntax and explain important reasoning.\n" +
  "- Do not claim to have access to private ApnaAcademy course material unless that material is explicitly provided in the conversation context.\n" +
  "- If you are uncertain, say so rather than inventing facts.\n" +
  "- Keep answers focused on the student's question.";

const normalizeMessage = (message) => ({
  role: message.role,
  content: message.content.trim(),
});

const validateMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    const error = new Error("At least one message is required.");
    error.statusCode = 400;
    error.code = "AI_MESSAGES_REQUIRED";
    throw error;
  }

  const normalized = messages.map(normalizeMessage);

  for (const message of normalized) {
    if (!["user", "assistant"].includes(message.role)) {
      const error = new Error("Only user and assistant message roles are accepted.");
      error.statusCode = 400;
      error.code = "AI_INVALID_MESSAGE_ROLE";
      throw error;
    }

    if (!message.content) {
      const error = new Error("Message content cannot be empty.");
      error.statusCode = 400;
      error.code = "AI_EMPTY_MESSAGE";
      throw error;
    }

    if (message.content.length > AI_CONFIG.maxInputChars) {
      const error = new Error(
        "Each message must be " + AI_CONFIG.maxInputChars + " characters or fewer."
      );
      error.statusCode = 413;
      error.code = "AI_MESSAGE_TOO_LARGE";
      throw error;
    }
  }

  if (normalized[normalized.length - 1].role !== "user") {
    const error = new Error("The last message must be from the user.");
    error.statusCode = 400;
    error.code = "AI_LAST_MESSAGE_MUST_BE_USER";
    throw error;
  }

  return normalized;
};

export const askAI = async ({ messages, maxTokens, temperature }) => {
  const normalizedMessages = validateMessages(messages);

  const totalInputChars = normalizedMessages.reduce(
    (total, message) => total + message.content.length,
    0
  );

  if (totalInputChars > AI_CONFIG.maxInputChars * 4) {
    const error = new Error("The conversation context is too large.");
    error.statusCode = 413;
    error.code = "AI_CONTEXT_TOO_LARGE";
    throw error;
  }

  const result = await generateChatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...normalizedMessages,
    ],
    maxTokens,
    temperature,
  });

  return {
    ...result,
    provider: AI_CONFIG.provider,
  };
};

export const getAIStatus = () => ({
  enabled: AI_CONFIG.enabled,
  provider: AI_CONFIG.provider,
  modelConfigured: Boolean(AI_CONFIG.model),
  apiKeyConfigured: Boolean(AI_CONFIG.apiKey),
});
