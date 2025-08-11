import express from "express";
import {
  queryTheses,
  //   getThesis,
  //   postThesis,
  //   patchThesis,
  //   deleteThesis,
  //   getThesisInvitations,
  //   getThesisCommittee,
  //   getThesisTimeline,
  //   getThesisNotes,
  //   postThesisNote,
} from "../controllers/thesis.js";

const router = express.Router();

router.get("/", queryTheses);
// router.get("/:id", getThesis);
// router.post("/", postThesis);
// router.patch("/:id", patchThesis);
// router.delete("/:id", deleteThesis);

// router.get("/:id/invitations", getThesisInvitations);
// router.get("/:id/committee", getThesisCommittee);
// router.get("/:id/timeline", getThesisTimeline);
// router.get("/:id/notes", getThesisNotes);
// router.post("/:id/notes", postThesisNote);

export default router;
