import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { managePresentation } from "../middleware/specific.js";
import { validate } from "../config/validation.js";
import {
  deletePresentationValidator,
  getPresentationValidator,
  patchPresentationValidator,
} from "../validators/presentation.validators.js";
import {
  getPresentation,
  patchPresentation,
  deletePresentation,
} from "../controllers/presentation.controller.js";

const router = express.Router();
router.use(authenticate);

router.get(
  "/:id",
  validate(getPresentationValidator),
  managePresentation,
  getPresentation
);
router.patch(
  "/:id",
  validate(patchPresentationValidator),
  managePresentation,
  patchPresentation
);
router.delete(
  "/:id",
  validate(deletePresentationValidator),
  managePresentation,
  deletePresentation
);

export default router;
