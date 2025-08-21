import express from "express";
import { authenticate, thesis } from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import presentationValidator from "../validators/presentation.validators.js";
import PresentationController from "../controllers/presentation.controller.js";
import { model } from "../middleware/model.js";
import { Presentation } from "../models/index.js";
import { ThesisRole } from "../constants.js";

const router = express.Router();
router.use(authenticate);

router.get(
  "/:id",
  validate(presentationValidator.get),
  model(Presentation, "presentation"),
  thesis(
    ThesisRole.STUDENT,
    ThesisRole.SUPERVISOR,
    ThesisRole.COMMITTEE_MEMBER
  ),
  PresentationController.get
);
router.put(
  "/:id",
  validate(presentationValidator.put),
  model(Presentation, "presentation"),
  thesis(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  PresentationController.put
);
router.delete(
  "/:id",
  validate(presentationValidator.delete),
  model(Presentation, "presentation"),
  thesis(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  PresentationController.delete
);

export default router;
