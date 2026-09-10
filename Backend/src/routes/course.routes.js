import { Router } from "express";

import {
  getCourses,
  getCourseBySlug,
} from "../controllers/course.controller.js";

const router = Router();

/**
 * Public course catalog.
 *
 * Guest users can browse published courses.
 */
router.get("/", getCourses);

/**
 * Public course details.
 *
 * Only first video of every published module
 * is available as preview.
 */
router.get("/:slug", getCourseBySlug);

export default router;