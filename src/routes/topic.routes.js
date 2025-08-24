import express from "express";
import multer from "multer";
import TopicController from "../controllers/topic.controller.js";
import topicValidators from "../validators/topic.validators.js";
import { validate } from "../config/validation.js";
import {
  requireProfessorOwner,
  requireAuth,
  requireRole,
} from "../middleware/authentication.js";
import { fileStorage } from "../config/file-storage.js";
import { Topic } from "../models/index.js";
import { model } from "../middleware/model.js";
import { UserRole } from "../constants.js";

const router = express.Router();
router.use(requireAuth);

// TODO
router.get("/", validate(topicValidators.query), TopicController.query);
// TODO
router.get(
  "/:id",
  validate(topicValidators.get),
  model(Topic, "topic"),
  TopicController.get
);

router.post(
  "/",
  validate(topicValidators.post),
  requireRole(UserRole.PROFESSOR),
  TopicController.post
);
router.put(
  "/:id",
  validate(topicValidators.put),
  model(Topic, "topic"),
  requireProfessorOwner(),
  TopicController.put
);
router.delete(
  "/:id",
  validate(topicValidators.delete),
  model(Topic, "topic"),
  requireProfessorOwner(),
  TopicController.delete
);
router.get(
  "/:id/description",
  validate(topicValidators.getDescription),
  model(Topic, "topic"),
  TopicController.getDescription
);
router.put(
  "/:id/description",
  validate(topicValidators.putDescription),
  multer({ storage: fileStorage }).single("file"),
  model(Topic, "topic"),
  requireProfessorOwner(),
  TopicController.putDescription
);

export default router;
