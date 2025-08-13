import express from "express";
import {
  queryTheses,
  getThesis,
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
  checkAuth,
} from "../middleware/authentication.js";
import { validate } from "express-joi-validations";
import { thesisParamsSchema, thesisQuerySchema } from "../schemas.js";

const router = express.Router();

router.get("/", checkAuth, validate({ query: thesisQuerySchema }), queryTheses);
router.get(
  "/:id",
  checkAuth,
  validate({ params: thesisParamsSchema }),
  getThesis
);
// Edit thesis
router.patch(
  "/:id",
  checkAuth,
  allowThesisOwnerOnly,
  validate({ query: thesisParamsSchema })
  // patchThesis
);
router.post(
  "/:id/invite",
  checkAuth,
  allowThesisOwnerOnly,
  validate({ params: thesisParamsSchema })
  // inviteProfessorToThesis
);

// router.post("/", postThesis);
// router.delete("/:id", deleteThesis);

// router.get("/:id/invitations", getThesisInvitations);
// router.get("/:id/committee", getThesisCommittee);
// router.get("/:id/timeline", getThesisTimeline);
// router.get("/:id/notes", getThesisNotes);
// router.post("/:id/notes", postThesisNote);

export default router;
