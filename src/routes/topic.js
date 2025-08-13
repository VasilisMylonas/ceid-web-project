import express from "express";
import { validate } from "express-joi-validations";
import { requireRole, authenticate } from "../middleware/authentication.js";
import { manageTopic } from "../middleware/specific.js";
import {
  topicQuerySchema,
  topicBodySchema,
  topicParamsSchema,
  patchTopicBodySchema,
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

router.get(
  "/",
  authenticate,
  validate({ query: topicQuerySchema }),
  queryTopics
);
router.get(
  "/:id",
  authenticate,
  validate({ params: topicParamsSchema }),
  getTopic
);
router.get(
  "/:id/description",
  authenticate,
  validate({ params: topicParamsSchema }),
  getTopicDescription
);
router.post(
  "/",
  authenticate,
  validate({ body: topicBodySchema }),
  requireRole("professor"),
  postTopic
);
router.patch(
  "/:id",
  authenticate,
  validate({
    params: topicParamsSchema,
    body: patchTopicBodySchema,
  }),
  manageTopic,
  patchTopic
);
router.post(
  "/:id/upload",
  authenticate,
  validate({ params: topicParamsSchema }),
  manageTopic,
  multer({ storage: topicDescriptionStorage }).single("file"),
  uploadTopicDescription
);

export default router;
