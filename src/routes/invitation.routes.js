import express from "express";
import { validate } from "express-joi-validations";
import { requireAuth } from "../middleware/authentication.js";
import invitationValidators from "../validators/invitation.validators.js";
import InvitationController from "../controllers/invitation.controller.js";

const router = express.Router();
router.use(requireAuth);

router.patch(
  // TODO: This should be PUT
  "/:id/response",
  validate(invitationValidators.patchResponse),
  InvitationController.patchResponse
);
router.delete(
  "/:id",
  validate(invitationValidators.delete),
  InvitationController.delete
);

export default router;
