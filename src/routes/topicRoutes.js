import express from "express";
import { createTopic, getTopics } from "../controllers/topicController.js";
import auth from "../middleware/auth.js";
import { professorOnly } from "../middleware/roles.js";

const router = express.Router();

router.get("/", auth, professorOnly, getTopics);
router.post("/", auth, professorOnly, createTopic);

export default router;
