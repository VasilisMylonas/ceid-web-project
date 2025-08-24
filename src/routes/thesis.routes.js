import express from "express";
import multer from "multer";
import { fileStorage } from "../config/file-storage.js";
import { requireAuth, requireRole } from "../middleware/authentication.js";
import { requireThesisRole } from "../middleware/thesis.js";
import { validate } from "../config/validation.js";
import { UserRole, ThesisRole } from "../constants.js";
import thesisValidator from "../validators/thesis.validators.js";
import ThesisController from "../controllers/thesis.controller.js";
import { model } from "../middleware/model.js";
import db from "../models/index.js";

const router = express.Router();
router.use(requireAuth);

router.post(
  "/",
  validate(thesisValidator.post),
  requireRole(UserRole.PROFESSOR),
  ThesisController.post
);
router.delete(
  "/:id",
  validate(thesisValidator.delete),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  ThesisController.delete
);
router.get(
  "/:id/invitations",
  validate(thesisValidator.getInvitations),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.SUPERVISOR, ThesisRole.STUDENT),
  ThesisController.getInvitations
);
router.post(
  "/:id/invitations",
  validate(thesisValidator.postInvitation),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT),
  ThesisController.postInvitation
);
router.post(
  "/:id/notes",
  validate(thesisValidator.postNote),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.COMMITTEE_MEMBER, ThesisRole.SUPERVISOR),
  ThesisController.postNote
);
router.get(
  "/:id/notes",
  validate(thesisValidator.getNotes),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.SUPERVISOR),
  ThesisController.getNotes
);
router.post(
  "/:id/cancel",
  validate(thesisValidator.cancel),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.SUPERVISOR),
  ThesisController.cancel
);
router.patch(
  "/:id/status",
  validate(thesisValidator.patchStatus),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.SUPERVISOR),
  ThesisController.patchStatus
);
router.get(
  "/:id/draft",
  validate(thesisValidator.getDraft),
  model(db.Thesis, "thesis"),
  requireThesisRole(
    ThesisRole.STUDENT,
    ThesisRole.SUPERVISOR,
    ThesisRole.COMMITTEE_MEMBER
  ),
  ThesisController.getDraft
);
router.put(
  "/:id/draft",
  validate(thesisValidator.putDraft),
  multer({ storage: fileStorage }).single("file"),
  model(db.Thesis, "thesis"),
  requireThesisRole(ThesisRole.STUDENT),
  ThesisController.putDraft
);

// TODO
router.get("/", validate(thesisValidator.query), ThesisController.query);

// TODO
router.get(
  "/:id",
  validate(thesisValidator.get),
  model(db.Thesis, "thesis"),
  requireThesisRole(
    ThesisRole.STUDENT,
    ThesisRole.SUPERVISOR,
    ThesisRole.COMMITTEE_MEMBER
  ),
  ThesisController.get
);

// router.get(
//   "/:id/timeline",
//   validate(thesisValidator.getTimeline),
//   model(db.Thesis, "thesis"),
//   requireThesisRole(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
//   ThesisController.getTimeline
// );
// router.get(
//   "/:id/announcement",
//   validate(thesisValidator.getAnnouncement),
//   model(db.Thesis, "thesis"),
//   requireThesisRole(ThesisRole.SUPERVISOR),
//   ThesisController.getAnnouncement
// );
// router.get(
//   "/:id/committee",
//   validate(thesisValidator.getCommittee),
//   model(db.Thesis, "thesis"),
//   ThesisController.getCommittee
// );
// router.get(
//   "/:id/grades",
//   validate(thesisValidator.getGrades),
//   model(db.Thesis, "thesis"),
//   ThesisController.getGrades
// );
// router.get(
//   "/:id/resources",
//   validate(thesisValidator.getResources),
//   model(db.Thesis, "thesis"),
//   ThesisController.getResources
// );
// router.get(
//   "/:id/presentations",
//   validate(thesisValidator.getPresentations),
//   model(db.Thesis, "thesis"),
//   ThesisController.getPresentations
// );
// router.post(
//   "/:id/grades",
//   validate(thesisValidator.postGrades),
//   model(db.Thesis, "thesis"),
//   requireThesisRole(ThesisRole.COMMITTEE_MEMBER, ThesisRole.SUPERVISOR),
//   ThesisController.postGrades
// );
// router.post(
//   "/:id/resources",
//   validate(thesisValidator.postResource),
//   model(db.Thesis, "thesis"),
//   requireThesisRole(ThesisRole.STUDENT),
//   ThesisController.postResource
// );
// router.post(
//   "/:id/presentations",
//   validate(thesisValidator.postPresentation),
//   model(db.Thesis, "thesis"),
//   requireThesisRole(ThesisRole.STUDENT),
//   ThesisController.postPresentation
// );

export default router;
