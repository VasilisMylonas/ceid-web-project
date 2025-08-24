import express from "express";
import { validate } from "express-joi-validations";
import { requireAuth } from "../middleware/authentication.js";
import invitationValidators from "../validators/invitation.validators.js";
import InvitationController from "../controllers/invitation.controller.js";
import { model } from "../middleware/model.js";
import db from "../models/index.js";

const router = express.Router();
router.use(requireAuth);

router.patch(
  "/:id/response",
  validate(invitationValidators.patchResponse),
  model(db.Invitation, "invitation"),
  InvitationController.patchResponse
);
router.delete(
  "/:id",
  validate(invitationValidators.delete),
  model(db.Invitation, "invitation"),
  InvitationController.delete
);

export default router;
