import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaLeaderboardController } from "../controllers/dsa.leaderboard.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", getDsaLeaderboardController);

export default router;
