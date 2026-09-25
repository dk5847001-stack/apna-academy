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
  ragEnabled: String(process.env.AI_RAG_ENABLED || "false").trim().toLowerCase() === "true",
  embeddingBaseUrl: String(process.env.NVIDIA_EMBEDDING_API_BASE_URL || process.env.NVIDIA_API_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, ""),
  embeddingModel: String(process.env.NVIDIA_EMBEDDING_MODEL || "nvidia/nemotron-3-embed-1b").trim(),
  embeddingDimensions: parsePositiveInteger(process.env.AI_RAG_EMBEDDING_DIMENSIONS, 2048),
  ragChunkChars: parsePositiveInteger(process.env.AI_RAG_CHUNK_CHARS, 1400),
  ragChunkOverlapChars: parsePositiveInteger(process.env.AI_RAG_CHUNK_OVERLAP_CHARS, 220),
  ragTopK: parsePositiveInteger(process.env.AI_RAG_TOP_K, 6),
  ragMaxContextChars: parsePositiveInteger(process.env.AI_RAG_MAX_CONTEXT_CHARS, 9000),
  ragMaxPdfBytes: parsePositiveInteger(process.env.AI_RAG_MAX_PDF_BYTES, 25 * 1024 * 1024),
  ragEmbeddingBatchSize: parsePositiveInteger(process.env.AI_RAG_EMBEDDING_BATCH_SIZE, 16),
  ragVectorIndexName: String(process.env.AI_RAG_VECTOR_INDEX_NAME || "ai_knowledge_embedding").trim(),
  ragUseVectorSearch: String(process.env.AI_RAG_USE_VECTOR_SEARCH || "false").trim().toLowerCase() === "true",
  ragAllowedPdfHosts: String(process.env.AI_RAG_ALLOWED_PDF_HOSTS || "drive.google.com,docs.google.com,drive.usercontent.google.com,storage.googleapis.com").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean),
});
