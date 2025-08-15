import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { manageNote } from "../middleware/specific.js";
import { validate } from "../config/validation.js";
import {
  deleteNoteValidator,
  getNoteValidator,
  patchNoteValidator,
} from "../validators/note.validators.js";
import {
  getNote,
  patchNote,
  deleteNote,
} from "../controllers/note.controller.js";

const router = express.Router();

router.get(
  "/:id",
  authenticate,
  validate(getNoteValidator),
  manageNote,
  getNote
);
router.patch(
  "/:id",
  authenticate,
  validate(patchNoteValidator),
  manageNote,
  patchNote
);
router.delete(
  "/:id",
  authenticate,
  validate(deleteNoteValidator),
  manageNote,
  deleteNote
);

export default router;
