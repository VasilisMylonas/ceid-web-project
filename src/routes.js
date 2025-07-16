import express from "express";
import { validate } from "express-joi-validations";
import { auth } from "./middleware.js";
import {
  loginBodySchema,
  userQuerySchema,
  userParamsSchema,
  patchUserBodySchema,
} from "./schemas.js";
import {
  queryUsers,
  getUser,
  patchUser,
  deleteUser,
} from "./controllers/userController.js";
import { login, logout } from "./controllers/authController.js";

const router = express.Router();

// Auth
router.post("/auth/login", validate({ body: loginBodySchema }), login);
router.post("/auth/logout", auth, logout);

// Users
router.get("/users", auth, validate({ query: userQuerySchema }), queryUsers);
router.get("/users/:id", auth, validate({ params: userParamsSchema }), getUser);
router.patch(
  "/users/:id",
  auth,
  validate({ params: userParamsSchema, body: patchUserBodySchema }),
  patchUser
);
router.delete(
  "/users/:id",
  auth,
  validate({ params: userParamsSchema }),
  deleteUser
);

export default router;
