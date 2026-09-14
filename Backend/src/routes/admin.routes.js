import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/admin.course.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/courses", listCourses);
router.post("/courses", createCourse);
router.get("/courses/:courseId", getCourse);
router.patch("/courses/:courseId", updateCourse);
router.delete("/courses/:courseId", deleteCourse);

router.post("/courses/:courseId/modules", createModule);
router.patch("/modules/:moduleId", updateModule);
router.delete("/modules/:moduleId", deleteModule);

router.post("/modules/:moduleId/videos", createVideo);
router.patch("/videos/:videoId", updateVideo);
router.delete("/videos/:videoId", deleteVideo);

export default router;
