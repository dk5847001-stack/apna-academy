import { createSubmission, getSubmission, isValidJudgeSecret } from "../services/dsa.submission.service.js";
import { processJudgeResult } from "../services/dsa.judge.callback.service.js";

export const submitDsaSolution = async (req, res, next) => {
  try {
    const submission = await createSubmission({
      userId: req.user.userId,
      problemSlug: req.body?.problemSlug,
      language: req.body?.language,
      code: req.body?.code,
    });

    return res.status(202).json({
      success: true,
      message: "Submission queued for secure judging.",
      data: submission,
    });
  } catch (error) {
    return next(error);
  }
};

export const getDsaSubmission = async (req, res, next) => {
  try {
    const submission = await getSubmission({
      userId: req.user.userId,
      submissionId: req.params.id,
    });

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    return next(error);
  }
};

export const receiveDsaJudgeResult = async (req, res, next) => {
  try {
    const providedSecret = req.get("X-Judge-Secret") || "";
    if (!isValidJudgeSecret(providedSecret)) {
      return res.status(401).json({ success: false, message: "Unauthorized judge callback." });
    }

    const result = await processJudgeResult({
      submissionId: req.params.id,
      status: req.body?.status,
      passedTests: req.body?.passedTests,
      totalTests: req.body?.totalTests,
      executionTimeMs: req.body?.executionTimeMs,
      memoryUsedMb: req.body?.memoryUsedMb,
      judgeMessage: req.body?.judgeMessage,
    });

    return res.status(200).json({ success: true, data: result.submission, duplicate: result.duplicate });
  } catch (error) {
    return next(error);
  }
};
