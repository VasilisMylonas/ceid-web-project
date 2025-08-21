import express from "express";
import multer from "multer";
import TopicController from "../controllers/topic.controller.js";
import TopicValidators from "../validators/topic.validators.js";
import { validate } from "../config/validation.js";
import { owner, authenticate, role } from "../middleware/authentication.js";
import { fileStorage } from "../config/file-storage.js";
import { Topic } from "../models/index.js";
import { model } from "../middleware/model.js";
import { UserRole } from "../constants.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(TopicValidators.query), TopicController.query);
router.post(
  "/",
  validate(TopicValidators.post),
  role(UserRole.PROFESSOR),
  TopicController.post
);

router.get(
  "/:id",
  validate(TopicValidators.get),
  model(Topic, "topic"),
  TopicController.get
);
router.put(
  "/:id",
  validate(TopicValidators.put),
  model(Topic, "topic"),
  owner("professorId"),
  TopicController.put
);
router.delete(
  "/:id",
  validate(TopicValidators.delete),
  model(Topic, "topic"),
  owner("professorId"),
  TopicController.delete
);
router.get(
  "/:id/description",
  validate(TopicValidators.getDescription),
  model(Topic, "topic"),
  TopicController.getDescription
);
router.put(
  "/:id/description",
  validate(TopicValidators.putDescription),
  multer({ storage: fileStorage }).single("file"),
  model(Topic, "topic"),
  owner("professorId"),
  TopicController.putDescription
);

export default router;
