import express from "express";
import { validate } from "../config/validation.js";
import { requireRole, authenticate } from "../middleware/authentication.js";
import { manageTopic } from "../middleware/specific.js";
import {
  postTopicDescriptionValidator,
  getTopicDescriptionValidator,
  queryTopicsValidator,
  getTopicValidator,
  postTopicValidator,
  patchTopicValidator,
  deleteTopicValidator,
} from "../validators/topic.validators.js";
import {
  queryTopics,
  postTopic,
  patchTopic,
  getTopic,
  deleteTopic,
  postTopicDescription,
  getTopicDescription,
} from "../controllers/topic.controller.js";
import multer from "multer";
import { topicDescriptionStorage } from "../config/file-storage.js";

const router = express.Router();

router.get("/", authenticate, validate(queryTopicsValidator), queryTopics);
router.get("/:id", authenticate, validate(getTopicValidator), getTopic);
router.get(
  "/:id/description",
  authenticate,
  validate(getTopicDescriptionValidator),
  getTopicDescription
);
router.post(
  "/",
  authenticate,
  validate(postTopicValidator),
  requireRole("professor"),
  postTopic
);
router.patch(
  "/:id",
  authenticate,
  validate(patchTopicValidator),
  manageTopic,
  patchTopic
);
router.delete(
  "/:id",
  authenticate,
  validate(deleteTopicValidator),
  manageTopic,
  deleteTopic
);
router.post(
  "/:id/description",
  authenticate,
  validate(postTopicDescriptionValidator),
  manageTopic,
  multer({ storage: topicDescriptionStorage }).single("file"),
  postTopicDescription
);

export default router;
