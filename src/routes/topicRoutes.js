import express from "express";
import {
  createTopic,
  getTopics,
  getTopic,
} from "../controllers/topicController.js";
import auth from "../middleware/auth.js";
import { professorOnly } from "../middleware/roles.js";

const router = express.Router();

/*
GET /api/topics (view all topics)
POST /api/topics (create topic)
GET /api/topics/:id (view topic)
PUT /api/topics/:id (update topic)
DELETE /api/topics/:id (delete topic)
*/

router.get("/", auth, professorOnly, getTopics);
router.post("/", auth, professorOnly, createTopic);
router.get("/:id", auth, professorOnly, getTopic);

export default router;
