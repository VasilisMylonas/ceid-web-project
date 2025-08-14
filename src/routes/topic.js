import express from "express";
import { validate } from "../config/validation.js";
import { requireRole, authenticate } from "../middleware/authentication.js";
import { manageTopic } from "../middleware/specific.js";
import {
  queryTopicsSchema,
  getTopicSchema,
  getTopicDescriptionSchema,
  postTopicSchema,
  uploadTopicDescriptionSchema,
  patchTopicSchema,
} from "../schemas.js";
import {
  queryTopics,
  postTopic,
  patchTopic,
  getTopic,
  uploadTopicDescription,
  getTopicDescription,
} from "../controllers/topic.js";
import multer from "multer";
import { topicDescriptionStorage } from "../config/file-storage.js";

const router = express.Router();

router.get("/", authenticate, validate(queryTopicsSchema), queryTopics);
router.get("/:id", authenticate, validate(getTopicSchema), getTopic);
router.get(
  "/:id/description",
  authenticate,
  validate(getTopicDescriptionSchema),
  getTopicDescription
);
router.post(
  "/",
  authenticate,
  validate(postTopicSchema),
  requireRole("professor"),
  postTopic
);
router.patch(
  "/:id",
  authenticate,
  validate(patchTopicSchema),
  manageTopic,
  patchTopic
);
router.post(
  "/:id/upload",
  authenticate,
  validate(uploadTopicDescriptionSchema),
  manageTopic,
  multer({ storage: topicDescriptionStorage }).single("file"),
  uploadTopicDescription
);

export default router;
