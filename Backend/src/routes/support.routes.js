import { Router } from "express";
import {
  createTicket,
  getTicket,
  getTickets,
} from "../controllers/support.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getTickets);
router.post("/", createTicket);
router.get("/:ticketId", getTicket);

export default router;
