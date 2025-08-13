import express from "express";
import { validate } from "express-joi-validations";
import {
  requireRole,
  allowTopicOwnerOnly,
  authenticate,
} from "../middleware/authentication.js";
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
router.post(
  "/",
  authenticate,
  requireRole("professor"),
  validate({ body: topicBodySchema }),
  postTopic
);
router.get(
  "/:id",
  authenticate,
  validate({ params: topicParamsSchema }),
  getTopic
);
router.patch(
  "/:id",
  authenticate,
  allowTopicOwnerOnly,
  validate({
    params: topicParamsSchema,
    body: patchTopicBodySchema,
  }),
  patchTopic
);
router.post(
  "/:id/upload",
  authenticate,
  allowTopicOwnerOnly,
  validate({ params: topicParamsSchema }),
  multer({ storage: topicDescriptionStorage }).single("file"),
  uploadTopicDescription
);
router.get(
  "/:id/description",
  authenticate,
  validate({ params: topicParamsSchema }),
  getTopicDescription
);

export default router;
