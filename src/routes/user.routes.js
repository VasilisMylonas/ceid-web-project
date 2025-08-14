import express from "express";
import { validate } from "../config/validation.js";
import { authenticate } from "../middleware/authentication.js";
import {
  getUserValidator,
  queryUsersValidator,
  patchUserValidator,
  deleteUserValidator,
} from "../validators/user.validators.js";
import {
  queryUsers,
  getUser,
  patchUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { manageUser } from "../middleware/specific.js";

const router = express.Router();

router.get("/", authenticate, validate(queryUsersValidator), queryUsers);
router.get(
  "/:id",
  authenticate,
  validate(getUserValidator),
  manageUser,
  getUser
);
router.patch(
  "/:id",
  authenticate,
  validate(patchUserValidator),
  manageUser,
  patchUser
);
router.delete(
  "/:id",
  authenticate,
  validate(deleteUserValidator),
  manageUser,
  deleteUser
);

export default router;
