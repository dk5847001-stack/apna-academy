import { AI_CONFIG } from "../config/ai.js";

const createProviderError = (message, statusCode = 502, code = "AI_PROVIDER_ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const parseProviderError = async (response) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // Keep the generic provider error below when the response is not JSON.
  }

  const providerMessage =
    payload?.detail ||
    payload?.message ||
    payload?.error?.message ||
    payload?.error ||
    "NVIDIA API request failed with HTTP " + response.status + ".";

  return String(providerMessage).slice(0, 500);
};

const assertConfigured = () => {
  if (!AI_CONFIG.enabled) {
    throw createProviderError("AI Assistant is currently disabled.", 503, "AI_DISABLED");
  }

  if (!AI_CONFIG.apiKey) {
    throw createProviderError("AI provider is not configured.", 503, "AI_PROVIDER_NOT_CONFIGURED");
  }

  if (!AI_CONFIG.model) {
    throw createProviderError("AI model is not configured.", 503, "AI_MODEL_NOT_CONFIGURED");
  }
};

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createProviderError("AI provider request timed out.", 504, "AI_PROVIDER_TIMEOUT");
    }

    throw createProviderError("AI provider could not be reached.", 502, "AI_PROVIDER_UNREACHABLE");
  } finally {
    clearTimeout(timeout);
  }
};

const extractAssistantText = (payload) => {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .filter((item) => item?.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("")
      .trim();
  }

  return "";
};

export const generateChatCompletion = async ({
  messages,
  maxTokens = AI_CONFIG.maxOutputTokens,
  temperature = AI_CONFIG.temperature,
}) => {
  assertConfigured();

  const response = await fetchWithTimeout(
    AI_CONFIG.baseUrl + "/chat/completions",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + AI_CONFIG.apiKey,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages,
        max_tokens: Math.min(
          Number(maxTokens) || AI_CONFIG.maxOutputTokens,
          AI_CONFIG.maxOutputTokens
        ),
        temperature: Number.isFinite(Number(temperature))
          ? Math.min(Math.max(Number(temperature), 0), 1)
          : AI_CONFIG.temperature,
        stream: false,
      }),
    },
    AI_CONFIG.timeoutMs
  );

  if (!response.ok) {
    const providerMessage = await parseProviderError(response);

    if (response.status === 401 || response.status === 403) {
      throw createProviderError(
        "AI provider authorization failed. Check the NVIDIA API key and API access permissions.",
        502,
        "AI_PROVIDER_AUTH_FAILED"
      );
    }

    if (response.status === 429) {
      throw createProviderError(
        "AI provider rate limit was reached. Please try again shortly.",
        429,
        "AI_PROVIDER_RATE_LIMITED"
      );
    }

    throw createProviderError(
      providerMessage,
      response.status >= 500 ? 502 : 400,
      "AI_PROVIDER_REQUEST_FAILED"
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw createProviderError(
      "AI provider returned an invalid response.",
      502,
      "AI_PROVIDER_INVALID_RESPONSE"
    );
  }

  const text = extractAssistantText(payload);

  if (!text) {
    throw createProviderError(
      "AI provider returned an empty response.",
      502,
      "AI_PROVIDER_EMPTY_RESPONSE"
    );
  }

  return {
    text,
    model: payload.model || AI_CONFIG.model,
    providerResponseId: payload.id || null,
    usage: payload.usage || null,
  };
};

export const getNvidiaModels = async () => {
  assertConfigured();

  const response = await fetchWithTimeout(
    AI_CONFIG.baseUrl + "/models",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + AI_CONFIG.apiKey,
      },
    },
    AI_CONFIG.timeoutMs
  );

  if (!response.ok) {
    const providerMessage = await parseProviderError(response);
    throw createProviderError(
      providerMessage,
      response.status >= 500 ? 502 : 400,
      "AI_PROVIDER_MODELS_REQUEST_FAILED"
    );
  }

  return response.json();
};
