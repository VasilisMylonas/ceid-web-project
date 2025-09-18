import express from "express";
import multer from "multer";
import { fileStorage } from "../config/file-storage.js";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import { UserRole } from "../constants.js";
import thesisValidator from "../validators/thesis.validators.js";
import ThesisController from "../controllers/thesis.controller.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/",
  validate(thesisValidator.query),
  requireRole(UserRole.SECRETARY),
  ThesisController.query
);
router.post(
  "/",
  validate(thesisValidator.post),
  requireRole(UserRole.PROFESSOR),
  ThesisController.post
);
router.get("/:id", validate(thesisValidator.get), ThesisController.get);
router.delete(
  "/:id",
  validate(thesisValidator.delete),
  ThesisController.delete
);
router.post(
  "/:id/examine",
  validate(thesisValidator.examine),
  ThesisController.examine
);
router.put(
  "/:id/nemertes-link",
  validate(thesisValidator.putNemertesLink),
  ThesisController.putNemertesLink
);
router.put(
  "/:id/grading",
  validate(thesisValidator.putGrading),
  ThesisController.putGrading
);
router.get(
  "/:id/draft",
  validate(thesisValidator.getDraft),
  ThesisController.getDraft
);
router.put(
  "/:id/draft",
  validate(thesisValidator.putDraft),
  multer({ storage: fileStorage }).single("file"),
  ThesisController.putDraft
);
router.post(
  "/:id/approve",
  validate(thesisValidator.approve),
  requireRole(UserRole.SECRETARY),
  ThesisController.approve
);
router.post(
  "/:id/cancel",
  validate(thesisValidator.cancel),
  ThesisController.cancel
);
router.post(
  "/:id/complete",
  validate(thesisValidator.complete),
  requireRole(UserRole.SECRETARY),
  ThesisController.complete
);
router.get(
  "/:id/invitations",
  validate(thesisValidator.getInvitations),
  ThesisController.getInvitations
);
router.post(
  "/:id/invitations",
  validate(thesisValidator.postInvitation),
  ThesisController.postInvitation
);
router.get(
  "/:id/notes",
  validate(thesisValidator.getNotes),
  ThesisController.getNotes
);
router.post(
  "/:id/notes",
  validate(thesisValidator.postNote),
  ThesisController.postNote
);
router.get(
  "/:id/resources",
  validate(thesisValidator.getResources),
  ThesisController.getResources
);
router.post(
  "/:id/resources",
  validate(thesisValidator.postResource),
  ThesisController.postResource
);
router.get(
  "/:id/presentations",
  validate(thesisValidator.getPresentations),
  ThesisController.getPresentations
);
router.post(
  "/:id/presentations",
  validate(thesisValidator.postPresentation),
  ThesisController.postPresentation
);
router.get(
  "/:id/timeline",
  validate(thesisValidator.getTimeline),
  ThesisController.getTimeline
);
router.get(
  "/:id/grades",
  validate(thesisValidator.getGrades),
  ThesisController.getGrades
);
router.put(
  "/:id/grade",
  validate(thesisValidator.putGrade),
  ThesisController.putGrade
);

// TODO: resources, presentations, resources
// Also check middleware here and in presentations/resources routes
// Who should be able to post/put/delete resources/presentations?

// TODO: announcement
// Bathmos, epi merous kritiria
// router.get(
//   "/:id/announcement",
//   validate(thesisValidator.getAnnouncement),
//   model(db.Thesis, "thesis"),
//   requireThesisRole(ThesisRole.SUPERVISOR),
//   ThesisController.getAnnouncement
// );

export default router;
