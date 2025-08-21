import express from "express";
import {
  queryTheses,
  getThesis,
  postThesis,
  patchThesis,
  deleteThesis,
  putThesisDocument,
  getThesisDocument,
  getThesisTimeline,
  getThesisNotes,
  getThesisResources,
  getThesisPresentations,
  getThesisInvitations,
  postThesisInvitations,
  postThesisNotes,
  postThesisResources,
  postThesisPresentations,
} from "../controllers/thesis.controller.js";
import { authenticate, role } from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import {
  queryThesesValidator,
  getThesisValidator,
  patchThesisValidator,
  deleteThesisValidator,
  putThesisDocumentValidator,
  getThesisDocumentValidator,
  getThesisTimelineValidator,
  postThesisValidator,
} from "../validators/thesis.validators.js";
import multer from "multer";
import { fileStorage } from "../config/file-storage.js";
import { manageThesis } from "../middleware/specific.js";
import { UserRole, ThesisRole } from "../constants.js";

const router = express.Router();
router.use(authenticate);

router.get("/", validate(queryThesesValidator), queryTheses);
router.post(
  "/",
  validate(postThesisValidator),
  role(UserRole.PROFESSOR),
  postThesis
);
router.get("/:id", validate(getThesisValidator), manageThesis(), getThesis);

router.patch(
  "/:id",
  validate(patchThesisValidator),
  manageThesis(ThesisRole.SUPERVISOR, ThesisRole.STUDENT),
  patchThesis
);
router.delete(
  "/:id",
  validate(deleteThesisValidator),
  manageThesis(ThesisRole.SUPERVISOR, ThesisRole.STUDENT),
  deleteThesis
);
router.put(
  "/:id/document",
  validate(putThesisDocumentValidator),
  manageThesis(ThesisRole.STUDENT),
  putThesisDocument
);

router.get(
  "/:id/document",
  validate(getThesisDocumentValidator),
  multer({ storage: fileStorage }).single("file"),
  manageThesis(),
  getThesisDocument
);
router.get(
  "/:id/timeline",
  validate(getThesisTimelineValidator),
  manageThesis(),
  getThesisTimeline
);

router.get("/:id/notes", manageThesis(ThesisRole.SUPERVISOR), getThesisNotes);
router.post("/:id/notes", manageThesis(ThesisRole.SUPERVISOR), postThesisNotes);

router.get("/:id/resources", manageThesis(), getThesisResources);
router.post(
  "/:id/resources",
  manageThesis(ThesisRole.STUDENT),
  postThesisResources
);

router.get("/:id/presentations", manageThesis(), getThesisPresentations);
router.post(
  "/:id/presentations",
  manageThesis(ThesisRole.STUDENT),
  postThesisPresentations
);

router.get("/:id/invitations", getThesisInvitations);
router.post(
  "/:id/invitations",
  manageThesis(ThesisRole.STUDENT),
  postThesisInvitations
);

export default router;
