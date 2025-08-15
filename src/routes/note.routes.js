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
router.use(authenticate);

router.get("/:id", validate(getNoteValidator), manageNote, getNote);
router.patch("/:id", validate(patchNoteValidator), manageNote, patchNote);
router.delete("/:id", validate(deleteNoteValidator), manageNote, deleteNote);

export default router;
