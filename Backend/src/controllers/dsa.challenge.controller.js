import { getDailyChallenge, getStudyPlan, listStudyPlans } from "../services/dsa.challenge.service.js";

export const getDsaDailyChallenge = async (req, res, next) => {
  try {
    const challenge = await getDailyChallenge(req.user.userId);
    if (!challenge) return res.status(404).json({ success: false, message: "No daily challenge is published for today." });
    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return next(error);
  }
};

export const getDsaStudyPlans = async (req, res, next) => {
  try {
    const plans = await listStudyPlans();
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return next(error);
  }
};

export const getDsaStudyPlan = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({ success: false, message: "Invalid study plan slug." });
    }
    const plan = await getStudyPlan(slug);
    if (!plan) return res.status(404).json({ success: false, message: "Study plan not found." });
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return next(error);
  }
};
