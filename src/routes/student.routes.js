import express from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "src/config/validation.js";
import { queryStudentsValidator } from "../validators/student.validators.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(queryStudentsValidator), queryStudents);

export default router;
