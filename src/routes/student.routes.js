import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import { queryStudentsValidator } from "../validators/student.validators.js";
import { queryStudents } from "../controllers/student.controller.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", validate(queryStudentsValidator), queryStudents);

export default router;
