import { AI_CONFIG } from "../config/ai.js";

const reject = (res, status, code, message) =>
  res.status(status).json({ success: false, code, message });

export const validatePublicAIRequest = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reject(res, 400, "AI_INVALID_REQUEST", "Invalid AI request body.");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return reject(res, 400, "AI_MESSAGES_REQUIRED", "At least one message is required.");
  }

  if (body.messages.length > AI_CONFIG.guestMaxMessages) {
    return reject(res, 413, "AI_GUEST_CONTEXT_TOO_LARGE", "Guest AI supports a short conversation context.");
  }

  let totalChars = 0;
  for (const message of body.messages) {
    if (!message || typeof message !== "object" || typeof message.content !== "string") {
      return reject(res, 400, "AI_INVALID_MESSAGE", "Each message must contain text content.");
    }
    totalChars += message.content.length;
    if (totalChars > AI_CONFIG.guestMaxInputChars) {
      return reject(res, 413, "AI_GUEST_INPUT_TOO_LARGE", "Your guest AI request is too large.");
    }
  }

  const last = body.messages[body.messages.length - 1];
  if (last.role !== "user" || !last.content.trim()) {
    return reject(res, 400, "AI_INVALID_LAST_MESSAGE", "The last message must contain your question.");
  }

  return next();
};
