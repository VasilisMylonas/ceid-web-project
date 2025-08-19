import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import { queryStudentsValidator } from "../validators/student.validators.js";
import { queryStudents } from "../controllers/student.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(queryStudentsValidator), queryStudents);

export default router;
