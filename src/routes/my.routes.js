import express from "express";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import { UserRole } from "../constants.js";
import MyController from "../controllers/my.controller.js";
import { validate } from "../middleware/validation.js";
import myValidators from "../validators/my.validators.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/topics",
  validate(myValidators.getTopics),
  requireRole(UserRole.PROFESSOR),
  MyController.getTopics
);
router.get(
  "/theses",
  validate(myValidators.getTheses),
  requireRole(UserRole.PROFESSOR),
  MyController.getTheses
);
router.get(
  "/invitations",
  validate(myValidators.getInvitations),
  requireRole(UserRole.PROFESSOR),
  MyController.getInvitations
);
router.get(
  "/profile",
  validate(myValidators.getProfile),
  MyController.getProfile
);
router.patch(
  "/profile",
  validate(myValidators.patchProfile),
  MyController.patchProfile
);
router.delete(
  "/profile",
  validate(myValidators.deleteProfile),
  MyController.deleteProfile
);
router.get(
  "/thesis",
  validate(myValidators.getThesis),
  requireRole(UserRole.STUDENT),
  MyController.getThesis
);

export default router;
