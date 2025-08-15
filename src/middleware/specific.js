import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import {
  Topic,
  Thesis,
  Note,
  Resource,
  Presentation,
  CommitteeMember,
} from "../models/index.js";

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
        role: "supervisor",
        endDate: { [Op.not]: null },
      },
    });

    if (
      ("student" in roles && isStudent) ||
      ("supervisor" in roles && isSupervisor) ||
      roles.length == 0
    ) {
      req.isStudent = isStudent;
      req.isSupervisor = isSupervisor;
      req.thesis = thesis;
      next();
    }

    return res.status(StatusCodes.FORBIDDEN).send();
  };
}

export async function manageNote(req, res, next) {
  const note = await Note.findByPk(req.params.id);
  if (!note) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (note.professorId != req.user.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  req.note = note;
  next();
}

export async function managePresentation(req, res, next) {
  const presentation = await Presentation.findByPk(req.params.id);
  if (!presentation) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (presentation.thesis.studentId != req.user.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  req.presentation = presentation;
  next();
}

export async function manageResource(req, res, next) {
  const resource = await Resource.findByPk(req.params.id);
  if (!resource) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (resource.thesis.studentId != req.user.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  req.resource = resource;
  next();
}
