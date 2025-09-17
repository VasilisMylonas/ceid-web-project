import express from "express";
import multer from "multer";
import TopicController from "../controllers/topic.controller.js";
import topicValidators from "../validators/topic.validators.js";
import { validate } from "../middleware/validation.js";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import { fileStorage } from "../config/file-storage.js";
import { UserRole } from "../constants.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", validate(topicValidators.query), TopicController.query);
router.get("/:id", validate(topicValidators.get), TopicController.get);
router.post(
  "/",
  validate(topicValidators.post),
  requireRole(UserRole.PROFESSOR),
  TopicController.post
);
router.put(
  "/:id",
  validate(topicValidators.put),
  requireRole(UserRole.PROFESSOR),
  TopicController.put
);
router.delete(
  "/:id",
  validate(topicValidators.delete),
  requireRole(UserRole.PROFESSOR),
  TopicController.delete
);
router.get(
  "/:id/description",
  validate(topicValidators.getDescription),
  TopicController.getDescription
);
router.put(
  "/:id/description",
  validate(topicValidators.putDescription),
  multer({ storage: fileStorage }).single("file"),
  requireRole(UserRole.PROFESSOR),
  TopicController.putDescription
);
router.delete(
  "/:id/description",
  validate(topicValidators.deleteDescription),
  requireRole(UserRole.PROFESSOR),
  TopicController.deleteDescription
);

export default router;
