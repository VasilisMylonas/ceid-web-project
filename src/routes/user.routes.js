import express from "express";
import { validate } from "../middleware/validation.js";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import userValidator from "../validators/user.validators.js";
import UserController from "../controllers/user.controller.js";
import { UserRole } from "../constants.js";

const router = express.Router();
router.use(requireAuth);

// TODO: perms?
router.get(
  "/professors",
  validate(userValidator.getProfessors),
  UserController.getProfessors
);
router.get(
  "/",
  validate(userValidator.query),
  requireRole(UserRole.SECRETARY),
  UserController.query
);
router.post(
  "/",
  validate(userValidator.post),
  requireRole(UserRole.SECRETARY),
  UserController.post
);
router.post(
  "/batch",
  validate(userValidator.postBatch),
  requireRole(UserRole.SECRETARY),
  UserController.postBatch
);
router.get(
  "/:id",
  validate(userValidator.get),
  requireRole(UserRole.SECRETARY),
  UserController.get
);
router.patch(
  "/:id",
  validate(userValidator.patch),
  requireRole(UserRole.SECRETARY),
  UserController.patch
);
router.delete(
  "/:id",
  validate(userValidator.delete),
  requireRole(UserRole.SECRETARY),
  UserController.delete
);

export default router;
