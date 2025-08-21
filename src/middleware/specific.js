import { StatusCodes } from "http-status-codes";
import {
  Topic,
  Thesis,
  Note,
  Resource,
  Presentation,
  CommitteeMember,
  Invitation,
} from "../models/index.js";
import { ThesisRole } from "../constants.js";

export async function manageUser(req, res, next) {
  if (req.user.id != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  // User already attached from authentication middleware
  next();
}

export async function manageTopic(req, res, next) {
  const topic = await Topic.findByPk(req.params.id);
  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (topic.professorId != req.user.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  req.topic = topic;
  next();
}

export function manageThesis(...roles) {
  return async (req, res, next) => {
    const thesis = await Thesis.findByPk(req.params.id);
    if (!thesis) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }

    const isStudent = thesis.studentId == req.user.id;
    const isSupervisor = await CommitteeMember.findOne({
      where: {
        thesisId: thesis.id,
        professorId: req.user.id,
        role: ThesisRole.SUPERVISOR,
        endDate: null,
      },
    });

    if (
      !(roles.includes(ThesisRole.STUDENT) && isStudent) &&
      !(roles.includes(ThesisRole.SUPERVISOR) && isSupervisor) &&
      roles.length != 0
    ) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }

    req.isStudent = !!isStudent;
    req.isSupervisor = !!isSupervisor;
    req.thesis = thesis;
    next();
  };
}

export async function manageInvitation(req, res, next) {
  const invitation = await Invitation.findByPk(req.params.id);
  if (!invitation) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (
    invitation.studentId != req.user.id &&
    invitation.professorId != req.user.id
  ) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  req.invitation = invitation;
  next();
}
