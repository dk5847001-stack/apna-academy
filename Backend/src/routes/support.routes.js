import { Router } from "express";
import { createTicket, getTicket, getTickets, replyTicket } from "../controllers/support.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", getTickets);
router.post("/", createTicket);
router.get("/:ticketId", getTicket);
router.post("/:ticketId/replies", replyTicket);

export default router;
