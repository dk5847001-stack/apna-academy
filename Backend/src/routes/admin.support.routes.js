import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getTicket, listTickets, updateTicket } from "../controllers/admin.support.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", listTickets);
router.get("/:ticketId", getTicket);
router.patch("/:ticketId", updateTicket);

export default router;
