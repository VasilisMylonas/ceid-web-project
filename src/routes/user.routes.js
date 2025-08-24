import express from "express";
import { validate } from "../config/validation.js";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import userValidator from "../validators/user.validators.js";
import UserController from "../controllers/user.controller.js";
import { UserRole } from "../constants.js";
import { User } from "../models/index.js";
import { model } from "../middleware/model.js";

const router = express.Router();
router.use(requireAuth);

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
router.put(
  "/",
  validate(userValidator.putAll),
  requireRole(UserRole.SECRETARY),
  UserController.putAll
);

// NOTE Conflict with model(User) and requireAuth user
router.get(
  "/:id",
  validate(userValidator.get),
  model(User, "targetUser"),
  requireRole(UserRole.SECRETARY),
  UserController.get
);
router.patch(
  "/:id",
  validate(userValidator.patch),
  model(User, "targetUser"),
  requireRole(UserRole.SECRETARY),
  UserController.patch
);
router.delete(
  "/:id",
  validate(userValidator.delete),
  model(User, "targetUser"),
  requireRole(UserRole.SECRETARY),
  UserController.delete
);

export default router;
