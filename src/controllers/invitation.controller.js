import { StatusCodes } from "http-status-codes";
import { InvitationResponse, ThesisStatus } from "../constants.js";
import { CommitteeMember } from "../models/index.js";

export default class InvitationController {
  static async patchResponse(req, res) {
    if (req.invitation.professorId !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not the receiver of this invitation.",
      });
    }

    if (req.invitation.response !== InvitationResponse.PENDING) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invitation already responded to." });
    }

    req.invitation.response = req.body.response;
    req.invitation.responseDate = new Date();
    await req.invitation.save();

    if (req.body.response === InvitationResponse.ACCEPTED) {
      CommitteeMember.create({
        professorId: req.user.id,
        thesisId: req.invitation.thesisId,
      });
    }

    // If there are at least 3 committee members and the thesis is still under assignment, set it to pending (awaiting approval from secretary)
    const thesis = await req.invitation.getThesis();
    const committeeMembers = await thesis.getCommitteeMembers({
      where: { professorId: req.user.id },
    });

    if (
      committeeMembers.length >= 3 &&
      thesis.status === ThesisStatus.UNDER_ASSIGNMENT
    ) {
      thesis.status = ThesisStatus.PENDING;
      await thesis.save();
    }

    res.status(StatusCodes.OK).json(req.invitation);
  }

  static async delete(req, res) {
    if (req.invitation.getThesis().getStudent().id !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not the sender of this invitation.",
      });
    }

    if (req.invitation.response !== InvitationResponse.PENDING) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invitation already responded to." });
    }

    await req.invitation.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
