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
import { validate } from "express-joi-validations";
import { thesisParamsSchema, thesisQuerySchema } from "../schemas.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  validate({ query: thesisQuerySchema }),
  queryTheses
);
router.get(
  "/:id",
  authenticate,
  validate({ params: thesisParamsSchema }),
  getThesis
);
router.patch(
  "/:id",
  authenticate,
  validate({ query: thesisParamsSchema }),
  manageThesis,
  patchThesis
);
router.post(
  "/:id/invite",
  authenticate,
  validate({ params: thesisParamsSchema }),
  manageThesis,
  inviteProfessorToThesis
);
router.delete(
  "/:id",
  authenticate,
  validate({ params: thesisParamsSchema }),
  manageThesis,
  deleteThesis
);

export default router;
