import express from "express";
import { validate } from "express-joi-validations";
import { requireAuth } from "../middleware/authentication.js";
import invitationValidators from "../validators/invitation.validators.js";
import InvitationController from "../controllers/invitation.controller.js";

const router = express.Router();
router.use(requireAuth);

router.put(
  "/:id/response",
  validate(invitationValidators.putResponse),
  InvitationController.putResponse
);
router.delete(
  "/:id",
  validate(invitationValidators.delete),
  InvitationController.delete
);

export default router;
