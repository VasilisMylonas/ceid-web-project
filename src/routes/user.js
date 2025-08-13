import express from "express";
import { validate } from "express-joi-validations";
import {
  allowSameUserOnly,
  authenticate,
} from "../middleware/authentication.js";
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

const router = express.Router();

router.get("/", authenticate, validate({ query: userQuerySchema }), queryUsers);
router.get(
  "/:id",
  authenticate,
  allowSameUserOnly,
  validate({ params: userParamsSchema }),
  getUser
);
router.patch(
  "/:id",
  authenticate,
  allowSameUserOnly,
  validate({ params: userParamsSchema, body: patchUserBodySchema }),
  patchUser
);
router.delete(
  "/:id",
  authenticate,
  allowSameUserOnly,
  validate({ params: userParamsSchema }),
  deleteUser
);

export default router;
