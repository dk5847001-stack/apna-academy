import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { validatePromo } from "../controllers/promoCode.controller.js";
import { releasePromo } from "../controllers/promoReservation.controller.js";

const router = Router();

router.post("/validate", authenticate, validatePromo);
router.post("/release-reservation", authenticate, releasePromo);

export default router;
