import express from "express";
import {
  requireAuth,
  requireProfessorOwner,
} from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import noteValidators from "../validators/note.validators.js";
import NoteController from "../controllers/note.controller.js";
import { model } from "../middleware/model.js";
import db from "../models/index.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/:id",
  validate(noteValidators.get),
  model(db.Note, "note"),
  requireProfessorOwner(),
  NoteController.get
);
router.put(
  "/:id",
  validate(noteValidators.put),
  model(db.Note, "note"),
  requireProfessorOwner(),
  NoteController.put
);
router.delete(
  "/:id",
  validate(noteValidators.delete),
  model(db.Note, "note"),
  requireProfessorOwner(),
  NoteController.delete
);

export default router;
