import { AI_CONFIG } from "../config/ai.js";

const createEmbeddingError = (message, statusCode = 502, code = "AI_EMBEDDING_ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const assertConfigured = () => {
  if (!AI_CONFIG.ragEnabled) throw createEmbeddingError("AI course knowledge is currently disabled.", 503, "AI_RAG_DISABLED");
  if (!AI_CONFIG.apiKey) throw createEmbeddingError("AI provider is not configured.", 503, "AI_PROVIDER_NOT_CONFIGURED");
};

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  catch (error) {
    if (error?.name === "AbortError") throw createEmbeddingError("Embedding provider request timed out.", 504, "AI_EMBEDDING_TIMEOUT");
    throw createEmbeddingError("Embedding provider could not be reached.", 502, "AI_EMBEDDING_UNREACHABLE");
  } finally { clearTimeout(timeout); }
};

const parseError = async (response) => {
  try {
    const payload = await response.json();
    return String(payload?.detail || payload?.message || payload?.error?.message || payload?.error || `Embedding API request failed with HTTP ${response.status}.`).slice(0, 500);
  } catch { return `Embedding API request failed with HTTP ${response.status}.`; }
};

const normalizeVector = (vector) => {
  if (!Array.isArray(vector) || vector.length !== AI_CONFIG.embeddingDimensions) throw createEmbeddingError("Embedding dimension mismatch. Expected " + AI_CONFIG.embeddingDimensions + " values.", 502, "AI_EMBEDDING_DIMENSION_MISMATCH");
  let magnitude = 0;
  for (const value of vector) {
    if (!Number.isFinite(Number(value))) throw createEmbeddingError("Embedding provider returned an invalid vector.", 502, "AI_EMBEDDING_INVALID_VECTOR");
    magnitude += Number(value) ** 2;
  }
  magnitude = Math.sqrt(magnitude);
  if (!Number.isFinite(magnitude) || magnitude === 0) throw createEmbeddingError("Embedding provider returned a zero vector.", 502, "AI_EMBEDDING_ZERO_VECTOR");
  return vector.map((value) => Number(value) / magnitude);
};

export const generateEmbeddings = async (texts, inputType = "passage") => {
  assertConfigured();
  if (!Array.isArray(texts) || texts.length === 0) throw createEmbeddingError("At least one text value is required.", 400, "AI_EMBEDDING_INPUT_REQUIRED");
  if (!["passage", "query"].includes(inputType)) throw createEmbeddingError("Embedding input type must be passage or query.", 400, "AI_EMBEDDING_INPUT_TYPE_INVALID");
  const normalizedTexts = texts.map((text) => String(text || "").trim());
  if (normalizedTexts.some((text) => !text)) throw createEmbeddingError("Embedding text cannot be empty.", 400, "AI_EMBEDDING_EMPTY_TEXT");
  const response = await fetchWithTimeout(AI_CONFIG.embeddingBaseUrl + "/embeddings", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + AI_CONFIG.apiKey },
    body: JSON.stringify({ input: normalizedTexts, model: AI_CONFIG.embeddingModel, input_type: inputType, encoding_format: "float", truncate: "NONE" }),
  }, AI_CONFIG.timeoutMs);
  if (!response.ok) {
    const message = await parseError(response);
    if (response.status === 401 || response.status === 403) throw createEmbeddingError("Embedding provider authorization failed.", 502, "AI_EMBEDDING_AUTH_FAILED");
    if (response.status === 429) throw createEmbeddingError("Embedding provider rate limit was reached. Please retry shortly.", 429, "AI_EMBEDDING_RATE_LIMITED");
    throw createEmbeddingError(message, response.status >= 500 ? 502 : 400, "AI_EMBEDDING_REQUEST_FAILED");
  }
  let payload;
  try { payload = await response.json(); } catch { throw createEmbeddingError("Embedding provider returned invalid JSON.", 502, "AI_EMBEDDING_INVALID_RESPONSE"); }
  const data = Array.isArray(payload?.data) ? payload.data : [];
  if (data.length !== normalizedTexts.length) throw createEmbeddingError("Embedding provider returned an unexpected number of vectors.", 502, "AI_EMBEDDING_COUNT_MISMATCH");
  return [...data].sort((a, b) => Number(a.index) - Number(b.index)).map((item) => normalizeVector(item.embedding));
};
