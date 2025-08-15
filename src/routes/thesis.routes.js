import express from "express";
import {
  queryTheses,
  getThesis,
  patchThesis,
  deleteThesis,
  putThesisDocument,
  getThesisDocument,
  getThesisTimeline,
  exportTheses,
} from "../controllers/thesis.controller.js";
import { authenticate } from "../middleware/authentication.js";
import { manageThesis } from "../middleware/specific.js";
import { validate } from "../config/validation.js";
import {
  queryThesesValidator,
  getThesisValidator,
  patchThesisValidator,
  deleteThesisValidator,
  putThesisDocumentValidator,
  getThesisDocumentValidator,
  getThesisTimelineValidator,
  exportThesesValidator,
} from "../validators/thesis.validators.js";
import multer from "multer";
import { fileStorage } from "../config/file-storage.js";

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
router.delete(
  "/:id",
  authenticate,
  validate(deleteThesisValidator),
  manageThesis,
  deleteThesis
);
router.put(
  "/:id/document",
  authenticate,
  validate(putThesisDocumentValidator),
  manageThesis,
  putThesisDocument
);
router.get(
  "/:id/document",
  authenticate,
  validate(getThesisDocumentValidator),
  manageThesis,
  multer({ storage: fileStorage }).single("file"),
  getThesisDocument
);
router.get(
  "/:id/timeline",
  authenticate,
  validate(getThesisTimelineValidator),
  manageThesis,
  getThesisTimeline
);
router.get(
  "/export",
  authenticate,
  validate(exportThesesValidator),
  exportTheses
);
// TODO
// router.get("/:id/notes");
// router.get("/:id/resources");
// router.get("/:id/presentations");
// router.get("/:id/invitations");
// router.post("/:id/notes");
// router.post("/:id/resources");
// router.post("/:id/presentations");
// router.post("/:id/invitations");

export default router;
