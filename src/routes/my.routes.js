import express from "express";
import { authenticate, role } from "../middleware/authentication.js";
import { UserRole } from "../constants.js";
import MyController from "../controllers/my.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/topics", role(UserRole.PROFESSOR), MyController.getTopics);
// router.get("/theses", requireRole(UserRole.PROFESSOR), getProfessorTheses);
// router.get(
//   "/invitations",
//   requireRole(UserRole.PROFESSOR),
//   getProfessorInviations
// );
// router.get("/notes");

export default router;
