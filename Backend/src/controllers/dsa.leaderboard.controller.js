import { getDsaLeaderboard } from "../services/dsa.leaderboard.service.js";

export const getDsaLeaderboardController = async (req, res, next) => {
  try {
    const data = await getDsaLeaderboard(req.user.userId, {
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
