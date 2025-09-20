import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import noteValidators from "../validators/note.validators.js";
import NoteController from "../controllers/note.controller.js";

const router = express.Router();
router.use(requireAuth);

router.get("/:id", validate(noteValidators.get), NoteController.get);
router.put("/:id", validate(noteValidators.put), NoteController.put);
router.delete("/:id", validate(noteValidators.delete), NoteController.delete);

export default router;
