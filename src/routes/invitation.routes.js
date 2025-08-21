import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { validate } from "../config/validation.js";
import {
  getInvitationValidator,
  patchInvitationValidator,
  acceptInvitationValidator,
  declineInvitationValidator,
} from "../validators/invitation.validators.js";
import {
  getInvitation,
  patchInvitation,
  acceptInvitation,
  declineInvitation,
  deleteInvitation,
} from "../controllers/invitation.controller.js";

const router = express.Router();
router.use(requireAuth);

// router.get(
//   "/:id",
//   validate(getInvitationValidator),
//   manageInvitation,
//   getInvitation
// );
// router.patch(
//   "/:id",
//   validate(patchInvitationValidator),
//   manageInvitation,
//   patchInvitation
// );
// router.delete("/:id", manageInvitation, deleteInvitation);
// router.post(
//   "/:id/accept",
//   validate(acceptInvitationValidator),
//   manageInvitation,
//   acceptInvitation
// );
// router.post(
//   "/:id/decline",
//   validate(declineInvitationValidator),
//   manageInvitation,
//   declineInvitation
// );

export default router;
