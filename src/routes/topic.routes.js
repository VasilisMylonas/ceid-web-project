import express from "express";
import { validate } from "../config/validation.js";
import { requireRole, authenticate } from "../middleware/authentication.js";
import { manageTopic } from "../middleware/specific.js";
import { uploadTopicDescriptionValidator } from "../validators/topic.validators.js";
import { patchTopicValidator } from "../validators/topic.validators.js";
import { postTopicValidator } from "../validators/topic.validators.js";
import { getTopicDescriptionValidator } from "../validators/topic.validators.js";
import { queryTopicsValidator } from "../validators/topic.validators.js";
import { getTopicValidator } from "../validators/topic.validators.js";
import {
  queryTopics,
  postTopic,
  patchTopic,
  getTopic,
  uploadTopicDescription,
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
router.post(
  "/:id/upload",
  authenticate,
  validate(uploadTopicDescriptionValidator),
  manageTopic,
  multer({ storage: topicDescriptionStorage }).single("file"),
  uploadTopicDescription
);

export default router;
