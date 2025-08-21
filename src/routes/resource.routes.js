import express from "express";
import { requireAuth, requireThesis } from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import resourceValidators from "../validators/resource.validators.js";
import ResourceController from "../controllers/resource.controller.js";
import { model } from "../middleware/model.js";
import { Resource } from "../models/index.js";
import { ThesisRole } from "../constants.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/:id",
  validate(resourceValidators.get),
  model(Resource, "resource"),
  requireThesis(
    ThesisRole.STUDENT,
    ThesisRole.SUPERVISOR,
    ThesisRole.COMMITTEE_MEMBER
  ),
  ResourceController.get
);
router.put(
  "/:id",
  validate(resourceValidators.put),
  model(Resource, "resource"),
  requireThesis(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  ResourceController.put
);
router.delete(
  "/:id",
  validate(resourceValidators.delete),
  model(Resource, "resource"),
  requireThesis(ThesisRole.STUDENT, ThesisRole.SUPERVISOR),
  ResourceController.delete
);

export default router;
