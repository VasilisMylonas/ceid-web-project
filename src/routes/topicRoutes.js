import express from "express";
import {
  createTopic,
  getTopics,
  getTopic,
} from "../controllers/topicController.js";
import auth from "../middleware/auth.js";
import { professorOnly } from "../middleware/roles.js";

const router = express.Router();

router.get("/", auth, getTopics);
router.post("/", auth, professorOnly, createTopic);
router.put("/:id", auth, professorOnly, createTopic);
router.get("/:id", auth, getTopic);

export default router;
