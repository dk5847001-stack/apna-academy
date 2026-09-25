import { askAI, getAIStatus } from "../services/ai.service.js";
import { getNvidiaModels } from "../services/nvidia.service.js";

export const chatWithAI = async (req, res, next) => {
  try {
    const result = await askAI({ ...(req.body || {}), metadata: { userId: req.user?.userId, feature: "chat", audience: "user" } });
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const chatWithGuestAI = async (req, res, next) => {
  try {
    const result = await askAI({ ...(req.body || {}), guest: true, metadata: { feature: "guest-chat", audience: "guest" } });
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: {
        text: result.text,
        model: result.model,
        provider: result.provider,
      },
      limits: { type: "guest" },
    });
  } catch (error) {
    return next(error);
  }
};

export const aiStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    data: getAIStatus(),
  });
};

export const publicAIStatus = (req, res) => {
  const status = getAIStatus();
  return res.status(200).json({
    success: true,
    data: {
      enabled: Boolean(status.enabled && status.modelConfigured && status.apiKeyConfigured),
      provider: "nvidia",
    },
  });
};

export const aiProviderModels = async (req, res, next) => {
  try {
    const models = await getNvidiaModels();
    return res.status(200).json({ success: true, data: models });
  } catch (error) {
    return next(error);
  }
};
