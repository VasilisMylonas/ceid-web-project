import express from "express";
import multer from "multer";
import { fileStorage } from "../config/file-storage.js";
import {
  requireAuth,
  requireRole,
  requireThesisRole,
} from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import { manageThesis } from "../middleware/specific.js";
import { UserRole, ThesisRole } from "../constants.js";
import thesisValidator from "../validators/thesis.validators.js";
import ThesisController from "../controllers/thesis.controller.js";
import { model } from "../middleware/model.js";
import { Thesis } from "../models/index.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", validate(thesisValidator.query), ThesisController.query);
router.post(
  "/",
  validate(thesisValidator.post),
  requireRole(UserRole.PROFESSOR),
  ThesisController.post
);

router.get(
  "/:id",
  validate(thesisValidator.get),
  model(Thesis, "thesis"),
  ThesisController.get
);
router.patch(
  "/:id",
  validate(thesisValidator.patch),
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  ThesisController.patch
);
router.delete(
  "/:id",
  validate(thesisValidator.delete),
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  ThesisController.delete
);
router.put(
  "/:id/document",
  validate(thesisValidator.putDocument),
  multer({ storage: fileStorage }).single("file"),
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT),
  ThesisController.putDocument
);

// TODO
router.get(
  "/:id/document",
  validate(thesisValidator.getDocument),
  model(Thesis, "thesis"),
  ThesisController.getDocument
);
router.get(
  "/:id/timeline",
  validate(thesisValidator.getTimeline),
  model(Thesis, "thesis"),
  ThesisController.getTimeline
);

router.get(
  ":id/notes",
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.SUPERVISOR),
  ThesisController.getNotes
);
router.get(
  ":id/resources",
  model(Thesis, "thesis"),
  ThesisController.getResources
);
router.get(
  ":id/presentations",
  model(Thesis, "thesis"),
  ThesisController.getPresentations
);
// TODO
// router.get(":id/invitations", ThesisController.getInvitations);

router.post(
  ":id/notes",
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.SUPERVISOR),
  ThesisController.postNotes
);
router.post(
  ":id/resources",
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT),
  ThesisController.postResources
);
router.post(
  ":id/presentations",
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT),
  ThesisController.postPresentations
);
router.post(
  ":id/invitations",
  model(Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT),
  ThesisController.postInvitations
);

export default router;
