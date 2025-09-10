import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { requireThesisRole } from "../middleware/thesis.js";
import { validate } from "../middleware/validation.js";
import presentationValidator from "../validators/presentation.validators.js";
import PresentationController from "../controllers/presentation.controller.js";
import { model } from "../middleware/model.js";
import db from "../models/index.js";
import { ThesisRole } from "../constants.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/:id",
  validate(presentationValidator.get),
  model(db.Presentation, "presentation"),
  requireThesisRole(
    ThesisRole.STUDENT,
    ThesisRole.SUPERVISOR,
    ThesisRole.COMMITTEE_MEMBER
  ),
  PresentationController.get
);
router.put(
  "/:id",
  validate(presentationValidator.put),
  model(db.Presentation, "presentation"),
  requireThesisRole(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  PresentationController.put
);
router.delete(
  "/:id",
  validate(presentationValidator.delete),
  model(db.Presentation, "presentation"),
  requireThesisRole(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  PresentationController.delete
);

export default router;
