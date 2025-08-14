import express from "express";
import { validate } from "../config/validation.js";
import { authenticate } from "../middleware/authentication.js";
import {
  getUserSchema,
  queryUsersSchema,
  patchUserSchema,
  deleteUserSchema,
} from "../schemas.js";
import {
  queryUsers,
  getUser,
  patchUser,
  deleteUser,
} from "../controllers/user.js";
import { manageUser } from "../middleware/specific.js";

const router = express.Router();

router.get("/", authenticate, validate(queryUsersSchema), queryUsers);
router.get("/:id", authenticate, validate(getUserSchema), manageUser, getUser);
router.patch(
  "/:id",
  authenticate,
  validate(patchUserSchema),
  manageUser,
  patchUser
);
router.delete(
  "/:id",
  authenticate,
  validate(deleteUserSchema),
  manageUser,
  deleteUser
);

export default router;
