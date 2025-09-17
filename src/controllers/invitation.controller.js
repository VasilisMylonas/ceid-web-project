import { StatusCodes } from "http-status-codes";
import { InvitationResponse, ThesisStatus } from "../constants.js";
import db from "../models/index.js";

export default class InvitationController {
  static async patchResponse(req, res) {
    const professor = await req.invitation.getProfessor();

    if (professor.userId !== req.user.id) {
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
      db.CommitteeMember.create({
        professorId: professor.id,
        thesisId: req.invitation.thesisId,
      });
    }

    // If there are at least 3 committee members and the thesis is still under assignment, set it to active
    const thesis = await req.invitation.getThesis();
    const committeeMembers = await thesis.getCommitteeMembers({
      where: { professorId: professor.id },
    });

    if (
      committeeMembers.length >= 3 &&
      thesis.status === ThesisStatus.UNDER_ASSIGNMENT
    ) {
      thesis.status = ThesisStatus.ACTIVE;
      await thesis.save();
    }

    // Remove all other pending invitations
    await db.Invitation.destroy({
      where: {
        thesisId: req.invitation.thesisId,
        response: InvitationResponse.PENDING,
      },
    });

    res.status(StatusCodes.OK).json(req.invitation);
  }

  static async delete(req, res) {
    const student = await req.invitation.getThesis().getStudent();

    if (student.userId !== req.user.id) {
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
    res.status(StatusCodes.NO_CONTENT).json();
  }
}
