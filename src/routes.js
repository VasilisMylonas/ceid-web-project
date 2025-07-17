import express from "express";
import { validate } from "express-joi-validations";
import {
  allowSameUserOnly,
  allowProfessorsOnly,
  checkAuth,
} from "./middleware/auth.js";
import {
  loginBodySchema,
  userQuerySchema,
  userParamsSchema,
  patchUserBodySchema,
  thesisTopicQuerySchema,
  thesisTopicBodySchema,
} from "./schemas.js";
import {
  queryUsers,
  getUser,
  patchUser,
  deleteUser,
} from "./controllers/userController.js";
import {
  queryThesisTopics,
  postThesisTopic,
} from "./controllers/thesisTopicController.js";
import { login, logout } from "./controllers/authController.js";

const router = express.Router();

// Auth
router.post("/auth/login", validate({ body: loginBodySchema }), login);
router.post("/auth/logout", checkAuth, logout);

// Users
router.get(
  "/users",
  checkAuth,
  validate({ query: userQuerySchema }),
  queryUsers
);
router.get(
  "/users/:id",
  checkAuth,
  allowSameUserOnly,
  validate({ params: userParamsSchema }),
  getUser
);
router.patch(
  "/users/:id",
  checkAuth,
  allowSameUserOnly,
  validate({ params: userParamsSchema, body: patchUserBodySchema }),
  patchUser
);
router.delete(
  "/users/:id",
  checkAuth,
  allowSameUserOnly,
  validate({ params: userParamsSchema }),
  deleteUser
);

// Thesis topics
router.get(
  "/thesis-topics",
  checkAuth,
  validate({ query: thesisTopicQuerySchema }),
  queryThesisTopics
);
router.post(
  "/thesis-topics",
  checkAuth,
  allowProfessorsOnly,
  validate({ body: thesisTopicBodySchema }),
  postThesisTopic
);

export default router;
``;
