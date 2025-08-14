import express from "express";
import {
  queryTheses,
  getThesis,
  patchThesis,
  inviteProfessorToThesis,
  deleteThesis,
  uploadThesisDocument,
  getThesisDocument,
} from "../controllers/thesis.controller.js";
import { authenticate } from "../middleware/authentication.js";
import { manageThesis } from "../middleware/specific.js";
import { validate } from "../config/validation.js";
import {
  queryThesesValidator,
  getThesisValidator,
  patchThesisValidator,
  inviteProfessorToThesisValidator,
  deleteThesisValidator,
  uploadThesisDocumentValidator,
  getThesisDocumentValidator,
} from "../validators/thesis.validators.js";

const router = express.Router();

router.get("/", authenticate, validate(queryThesesValidator), queryTheses);
router.get("/:id", authenticate, validate(getThesisValidator), getThesis);
router.patch(
  "/:id",
  authenticate,
  validate(patchThesisValidator),
  manageThesis,
  patchThesis
);
router.post(
  "/:id/invite",
  authenticate,
  validate(inviteProfessorToThesisValidator),
  manageThesis,
  inviteProfessorToThesis
);
router.delete(
  "/:id",
  authenticate,
  validate(deleteThesisValidator),
  manageThesis,
  deleteThesis
);
router.post(
  "/:id/upload",
  authenticate,
  validate(uploadThesisDocumentValidator),
  manageThesis,
  uploadThesisDocument
);
router.get(
  "/:id/document",
  authenticate,
  validate(getThesisDocumentValidator),
  getThesisDocument
);

export default router;
