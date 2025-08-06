import express from "express";
import { validate } from "express-joi-validations";
import { allowSameUserOnly, checkAuth } from "../middleware/authentication.js";
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

router.get("/", checkAuth, validate({ query: userQuerySchema }), queryUsers);
router.get(
  "/:id",
  checkAuth,
  allowSameUserOnly,
  validate({ params: userParamsSchema }),
  getUser
);
router.patch(
  "/:id",
  checkAuth,
  allowSameUserOnly,
  validate({ params: userParamsSchema, body: patchUserBodySchema }),
  patchUser
);
router.delete(
  "/:id",
  checkAuth,
  allowSameUserOnly,
  validate({ params: userParamsSchema }),
  deleteUser
);

export default router;
