import express from "express";
import { validate } from "express-joi-validations";
import { authenticate } from "../middleware/authentication.js";
import {
  userQuerySchema,
  userParamsSchema,
  patchUserBodySchema,
} from "../schemas.js";
import {
  queryUsers,
  getUser,
  patchUser,
  deleteUser,
} from "../controllers/user.js";
import { manageUser } from "../middleware/specific.js";

const router = express.Router();

router.get("/", authenticate, validate({ query: userQuerySchema }), queryUsers);
router.get(
  "/:id",
  authenticate,
  validate({ params: userParamsSchema }),
  manageUser,
  getUser
);
router.patch(
  "/:id",
  authenticate,
  validate({ params: userParamsSchema, body: patchUserBodySchema }),
  manageUser,
  patchUser
);
router.delete(
  "/:id",
  authenticate,
  validate({ params: userParamsSchema }),
  manageUser,
  deleteUser
);

export default router;
