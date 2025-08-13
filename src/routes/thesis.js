import express from "express";
import {
  queryTheses,
  getThesis,
  patchThesis,
  inviteProfessorToThesis,
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

// TODO: implement
// router.post("/", postThesis);
// router.delete("/:id", deleteThesis);

// router.get("/:id/invitations", getThesisInvitations);
// router.get("/:id/committee", getThesisCommittee);
// router.get("/:id/timeline", getThesisTimeline);
// router.get("/:id/notes", getThesisNotes);
// router.post("/:id/notes", postThesisNote);

export default router;
