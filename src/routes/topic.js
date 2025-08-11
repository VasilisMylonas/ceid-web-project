import express from "express";
import { validate } from "express-joi-validations";
import {
  allowProfessorsOnly,
  checkAuth,
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

router.get("/", checkAuth, validate({ query: topicQuerySchema }), queryTopics);
router.post(
  "/",
  checkAuth,
  allowProfessorsOnly,
  validate({ body: topicBodySchema }),
  postTopic
);
router.get(
  "/:id",
  checkAuth,
  validate({ params: topicParamsSchema }),
  getTopic
);
router.patch(
  "/:id",
  checkAuth,
  allowProfessorsOnly,
  validate({
    params: topicParamsSchema,
    body: patchTopicBodySchema,
  }),
  patchTopic
);
router.post(
  "/:id/upload",
  checkAuth,
  allowProfessorsOnly,
  validate({ params: topicParamsSchema }),
  multer({ storage: topicDescriptionStorage }).single("file"),
  uploadTopicDescription
);
router.get(
  "/:id/description",
  checkAuth,
  validate({ params: topicParamsSchema }),
  getTopicDescription
);

export default router;
