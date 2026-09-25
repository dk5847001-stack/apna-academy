import { askAI, getAIStatus } from "../services/ai.service.js";
import { getNvidiaModels } from "../services/nvidia.service.js";

export const chatWithAI = async (req, res, next) => {
  try {
    const result = await askAI(req.body || {});

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: result,
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

export const aiProviderModels = async (req, res, next) => {
  try {
    const models = await getNvidiaModels();

    return res.status(200).json({
      success: true,
      data: models,
    });
  } catch (error) {
    return next(error);
  }
};
