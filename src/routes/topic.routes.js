import express from "express";
import { validate } from "../config/validation.js";
import { requireRole, authenticate } from "../middleware/authentication.js";
import { manageTopic } from "../middleware/specific.js";
import {
  putTopicDescriptionValidator,
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
  putTopicDescription,
  getTopicDescription,
} from "../controllers/topic.controller.js";
import multer from "multer";
import { fileStorage } from "../config/file-storage.js";
import { UserRole } from "../constants.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(queryTopicsValidator), queryTopics);
router.get("/:id", validate(getTopicValidator), getTopic);
router.get(
  "/:id/description",
  validate(getTopicDescriptionValidator),
  getTopicDescription
);
router.post(
  "/",
  validate(postTopicValidator),
  requireRole(UserRole.PROFESSOR),
  postTopic
);
router.patch("/:id", validate(patchTopicValidator), manageTopic, patchTopic);
router.delete("/:id", validate(deleteTopicValidator), manageTopic, deleteTopic);
router.put(
  "/:id/description",
  validate(putTopicDescriptionValidator),
  manageTopic,
  multer({ storage: fileStorage }).single("file"),
  putTopicDescription
);

export default router;
