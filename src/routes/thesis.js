import express from "express";
import {
  queryTheses,
  getThesis,
  patchThesis,
  inviteProfessorToThesis,
  //   postThesis,
  //   patchThesis,
  //   deleteThesis,
  //   getThesisInvitations,
  //   getThesisCommittee,
  //   getThesisTimeline,
  //   getThesisNotes,
  //   postThesisNote,
} from "../controllers/thesis.js";
import {
  allowThesisOwnerOnly,
  authenticate,
} from "../middleware/authentication.js";
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
  allowThesisOwnerOnly,
  validate({ query: thesisParamsSchema }),
  patchThesis
);
router.post(
  "/:id/invite",
  authenticate,
  allowThesisOwnerOnly,
  validate({ params: thesisParamsSchema }),
  inviteProfessorToThesis
);

// router.post("/", postThesis);
// router.delete("/:id", deleteThesis);

// router.get("/:id/invitations", getThesisInvitations);
// router.get("/:id/committee", getThesisCommittee);
// router.get("/:id/timeline", getThesisTimeline);
// router.get("/:id/notes", getThesisNotes);
// router.post("/:id/notes", postThesisNote);

export default router;
