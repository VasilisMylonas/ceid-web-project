import express from "express";

import auth from "./middleware/auth.js";
import { professorOnly } from "./middleware/roles.js";

import { getUserInfo, getProfessors } from "./controllers/userController.js";
import { login, logout } from "./controllers/authController.js";
import {
  createTopic,
  getTopics,
  getTopic,
  editTopic,
} from "./controllers/topicController.js";

const router = express.Router();

// Auth
router.post("/auth/login", login);
router.post("/auth/logout", auth, logout);

// Users
router.get("/users/me", auth, getUserInfo);
router.get("/users/professors", auth, getProfessors);

// Topics
router.get("/topics/", auth, getTopics);
router.get("/topics/:id", auth, getTopic);
router.post("/topics", auth, professorOnly, createTopic);
router.put("/topics/:id", auth, professorOnly, editTopic);

export default router;
