import express from "express";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import { UserRole } from "../constants.js";
import MyController from "../controllers/my.controller.js";

const router = express.Router();
router.use(requireAuth);

// TODO

// status=assigned|unassigned
router.get("/topics", requireRole(UserRole.PROFESSOR), MyController.getTopics);
// status=? role=?
router.get("/theses", requireRole(UserRole.PROFESSOR), MyController.getTheses);
// format=csv|json|xml
router.get(
  "/theses/export",
  requireRole(UserRole.PROFESSOR),
  MyController.exportTheses
);
router.get(
  "/theses/statistics",
  requireRole(UserRole.PROFESSOR),
  MyController.getThesisStatistics
);

router.get(
  "/invitations",
  requireRole(UserRole.PROFESSOR),
  MyController.getInvitations
);

export default router;
