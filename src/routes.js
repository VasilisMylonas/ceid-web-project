import express from "express";

import auth from "./middleware/auth.js";

import { getUserInfo, queryUsers } from "./controllers/userController.js";
import { login, logout } from "./controllers/authController.js";
// import {
//   createTopic,
//   getTopics,
//   getTopic,
//   editTopic,
// } from "../old/topicController.js";

const router = express.Router();

// Auth
router.post("/auth/login", login);
router.post("/auth/logout", auth, logout);

// Users
router.get("/users", auth, queryUsers);
router.get("/users/me", auth, getUserInfo);
// router.get("/usersprofessors", auth, getProfessors);

// // Topics
// router.get("/topics/", auth, getTopics);
// router.get("/topics/:id", auth, getTopic);
// router.post("/topics", auth, createTopic);
// router.put("/topics/:id", auth, editTopic);

export default router;
