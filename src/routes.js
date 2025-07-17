import express from "express";
import { validate } from "express-joi-validations";
import { auth, allowSameUser } from "./middleware.js";
import {
  loginBodySchema,
  userQuerySchema,
  userParamsSchema,
  patchUserBodySchema,
  thesisTopicQuerySchema,
} from "./schemas.js";
import {
  queryUsers,
  getUser,
  patchUser,
  deleteUser,
} from "./controllers/userController.js";
import { queryThesisTopics } from "./controllers/thesisTopicController.js";
import { login, logout } from "./controllers/authController.js";

const router = express.Router();

// Auth
router.post("/auth/login", validate({ body: loginBodySchema }), login);
router.post("/auth/logout", auth, logout);

// Users
router.get("/users", auth, validate({ query: userQuerySchema }), queryUsers);
router.get(
  "/users/:id",
  auth,
  allowSameUser,
  validate({ params: userParamsSchema }),
  getUser
);
router.patch(
  "/users/:id",
  auth,
  allowSameUser,
  validate({ params: userParamsSchema, body: patchUserBodySchema }),
  patchUser
);
router.delete(
  "/users/:id",
  auth,
  allowSameUser,
  validate({ params: userParamsSchema }),
  deleteUser
);

// Thesis topics
router.get(
  "/thesis-topics",
  auth,
  validate({ query: thesisTopicQuerySchema }),
  queryThesisTopics
);
// Implement thesis topics

export default router;
