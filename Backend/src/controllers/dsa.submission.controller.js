import { createSubmission, getSubmission } from "../services/dsa.submission.service.js";

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
