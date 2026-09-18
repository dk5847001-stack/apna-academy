import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { validatePromo } from "../controllers/promoCode.controller.js";

const router = Router();

router.post("/validate", authenticate, validatePromo);

export default router;
