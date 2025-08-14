import express from "express";
import {
  queryTheses,
  getThesis,
  patchThesis,
  inviteProfessorToThesis,
  deleteThesis,
} from "../controllers/thesis.js";
import { authenticate } from "../middleware/authentication.js";
import { manageThesis } from "../middleware/specific.js";
import { validate } from "../config/validation.js";
import { queryThesesSchema } from "../schemas.js";

const router = express.Router();

router.get("/", authenticate, validate(queryThesesSchema), queryTheses);
router.get(
  "/:id",
  authenticate,
  // TODO: schema
  getThesis
);
router.patch(
  "/:id",
  authenticate,
  // TODO: schema
  manageThesis,
  patchThesis
);
router.post(
  "/:id/invite",
  authenticate,
  // TODO: schema
  manageThesis,
  inviteProfessorToThesis
);
router.delete(
  "/:id",
  authenticate,
  // TODO: schema
  manageThesis,
  deleteThesis
);

export default router;
