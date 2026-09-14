import { Router } from "express";
import { subscribe } from "../controllers/subscriber.controller.js";

const router = Router();
router.post("/", subscribe);
export default router;
