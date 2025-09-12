import express from "express";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import studentValidators from "../validators/student.validators.js";
import { queryStudents } from "../controllers/student.controller.js";
import { UserRole } from "src/constants.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  validate(studentValidators.query),
  requireRole(UserRole.PROFESSOR),
  queryStudents
);

export default router;
