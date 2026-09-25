const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseUnitInterval = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

export const AI_CONFIG = Object.freeze({
  enabled: String(process.env.AI_ENABLED || "false").trim().toLowerCase() === "true",
  provider: "nvidia",
  baseUrl: String(process.env.NVIDIA_API_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, ""),
  apiKey: String(process.env.NVIDIA_NIM_API_KEY || "").trim(),
  model: String(process.env.NVIDIA_MODEL || "").trim(),
  timeoutMs: parsePositiveInteger(process.env.NVIDIA_TIMEOUT_MS, 30_000),
  maxInputChars: parsePositiveInteger(process.env.AI_MAX_INPUT_CHARS, 6_000),
  maxOutputTokens: parsePositiveInteger(process.env.AI_MAX_OUTPUT_TOKENS, 1_024),
  temperature: parseUnitInterval(process.env.AI_TEMPERATURE, 0.2),
  guestDailyRequests: parsePositiveInteger(process.env.AI_GUEST_DAILY_REQUESTS, 5),
  guestWindowMs: parsePositiveInteger(process.env.AI_GUEST_WINDOW_MS, 60_000),
  guestWindowRequests: parsePositiveInteger(process.env.AI_GUEST_WINDOW_REQUESTS, 3),
  guestMaxInputChars: parsePositiveInteger(process.env.AI_GUEST_MAX_INPUT_CHARS, 2_500),
  guestMaxOutputTokens: parsePositiveInteger(process.env.AI_GUEST_MAX_OUTPUT_TOKENS, 512),
  guestMaxMessages: parsePositiveInteger(process.env.AI_GUEST_MAX_MESSAGES, 4),
  authWindowMs: parsePositiveInteger(process.env.AI_AUTH_WINDOW_MS, 60_000),
  authWindowRequests: parsePositiveInteger(process.env.AI_AUTH_WINDOW_REQUESTS, 10),
  authDailyRequests: parsePositiveInteger(process.env.AI_AUTH_DAILY_REQUESTS, 100),
  authDailyWindowMs: parsePositiveInteger(process.env.AI_AUTH_DAILY_WINDOW_MS, 86_400_000),
  authMaxConcurrentUser: parsePositiveInteger(process.env.AI_AUTH_MAX_CONCURRENT_USER, 2),
  authMaxConcurrentIp: parsePositiveInteger(process.env.AI_AUTH_MAX_CONCURRENT_IP, 3),
});
