import {
  addMessageAndGenerateReply,
  archiveConversation,
  createConversation,
  getConversationMessages,
  listConversations,
  renameConversation,
} from "../services/aiConversation.service.js";

const getUserId = (req) => req.user?.userId;

export const getAIConversations = async (req, res, next) => {
  try {
    const data = await listConversations({ userId: getUserId(req), limit: req.query.limit });
    return res.status(200).json({ success: true, data });
  } catch (error) { return next(error); }
};

export const postAIConversation = async (req, res, next) => {
  try {
    const data = await createConversation({ userId: getUserId(req), title: req.body?.title });
    return res.status(201).json({ success: true, message: "AI conversation created.", data });
  } catch (error) { return next(error); }
};

export const getAIConversationMessages = async (req, res, next) => {
  try {
    const data = await getConversationMessages({
      userId: getUserId(req),
      conversationId: req.params.conversationId,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) { return next(error); }
};

export const postAIConversationMessage = async (req, res, next) => {
  try {
    const data = await addMessageAndGenerateReply({
      userId: getUserId(req),
      conversationId: req.params.conversationId,
      content: req.body?.content,
      maxTokens: req.body?.maxTokens,
      temperature: req.body?.temperature,
    });
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: {
        conversation: data.conversation,
        userMessage: {
          id: data.userMessage._id,
          role: data.userMessage.role,
          content: data.userMessage.content,
          createdAt: data.userMessage.createdAt,
        },
        assistantMessage: {
          id: data.assistantMessage._id,
          role: data.assistantMessage.role,
          content: data.assistantMessage.content,
          createdAt: data.assistantMessage.createdAt,
        },
        model: data.model,
        provider: data.provider,
      },
    });
  } catch (error) { return next(error); }
};

export const patchAIConversation = async (req, res, next) => {
  try {
    const data = await renameConversation({
      userId: getUserId(req),
      conversationId: req.params.conversationId,
      title: req.body?.title,
    });
    return res.status(200).json({ success: true, message: "AI conversation renamed.", data });
  } catch (error) { return next(error); }
};

export const deleteAIConversation = async (req, res, next) => {
  try {
    const data = await archiveConversation({
      userId: getUserId(req),
      conversationId: req.params.conversationId,
    });
    return res.status(200).json({ success: true, message: "AI conversation archived.", data });
  } catch (error) { return next(error); }
};
