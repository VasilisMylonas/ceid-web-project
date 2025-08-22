import express from "express";
import { validate } from "../config/validation.js";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import userValidator from "../validators/user.validators.js";
import UserController from "../controllers/user.controller.js";
import { requireSameUser } from "../middleware/user.js";
import { UserRole } from "../constants.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", validate(userValidator.query), UserController.query);
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

router.get(
  "/:id",
  validate(userValidator.get),
  requireSameUser(),
  UserController.get
);
router.patch(
  "/:id",
  validate(userValidator.patch),
  requireSameUser(),
  UserController.patch
);
router.delete(
  "/:id",
  validate(userValidator.delete),
  requireSameUser(),
  UserController.delete
);

export default router;
