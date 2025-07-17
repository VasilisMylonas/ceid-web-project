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
} from "../controllers/topicController.js";

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
  uploadTopicDescription
);

export default router;
