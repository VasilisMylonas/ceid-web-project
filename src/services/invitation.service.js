import { NotFoundError } from "adminjs";
import { InvitationResponse, ThesisStatus } from "../constants.js";
import db from "../models/index.js";
import { ConflictError, SecurityError } from "src/errors.js";

export default class InvitationService {
  static async respond(id, user, response) {
    const invitation = await db.Invitation.findByPk(id);
    if (!invitation) {
      throw new NotFoundError("No such invitation.");
    }

    const professor = await user.getProfessor();

    if (!professor || professor.id !== invitation.professorId) {
      throw new SecurityError("You are not the receiver of this invitation.");
    }

    if (invitation.response !== InvitationResponse.PENDING) {
      throw new ConflictError("Invitation already responded to.");
    }

    await invitation.update({ response, responseDate: new Date() });

    // Add as committee member
    if (response === InvitationResponse.ACCEPTED) {
      await db.CommitteeMember.create({
        professorId: professor.id,
        thesisId: invitation.thesisId,
      });
    }

    const thesis = await invitation.getThesis();
    const committeeMemberCount = await db.CommitteeMembers.count({
      where: { thesisId: thesis.id },
    });

    // Move thesis to ACTIVE state
    if (
      committeeMemberCount >= 3 &&
      thesis.status === ThesisStatus.UNDER_ASSIGNMENT
    ) {
      await thesis.update({ status: ThesisStatus.ACTIVE });
    }

    // Destroy all pending invitations for this thesis
    await db.Invitation.destroy({
      where: {
        thesisId: invitation.thesisId,
        response: InvitationResponse.PENDING,
      },
    });

    return invitation;
  }

  static async delete(id, user) {
    const invitation = await db.Invitation.findByPk(id);
    if (!invitation) {
      throw new NotFoundError("No such invitation.");
    }

    const student = await user.getStudent();
    const thesis = await invitation.getThesis();
    const sender = await thesis.getStudent();

    if (!student || student.id !== sender.id) {
      throw new SecurityError("You are not the sender of this invitation.");
    }

    if (invitation.response !== InvitationResponse.PENDING) {
      throw new ConflictError("The receiver already responded.");
    }

    await invitation.destroy();
  }
}
