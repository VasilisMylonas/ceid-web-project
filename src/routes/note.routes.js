import express from "express";
import { requireAuth, requireOwner } from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import noteValidators from "../validators/note.validators.js";
import NoteController from "../controllers/note.controller.js";
import { model } from "../middleware/model.js";
import { Note } from "../models/index.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/:id",
  validate(noteValidators.get),
  model(Note, "note"),
  requireOwner(),
  NoteController.get
);
router.put(
  "/:id",
  validate(noteValidators.put),
  model(Note, "note"),
  requireOwner(),
  NoteController.put
);
router.delete(
  "/:id",
  validate(noteValidators.delete),
  model(Note, "note"),
  requireOwner(),
  NoteController.delete
);

export default router;
