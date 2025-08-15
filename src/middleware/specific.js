import { StatusCodes } from "http-status-codes";
import {
  Topic,
  Thesis,
  Note,
  Resource,
  Presentation,
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

export async function manageThesis(req, res, next) {
  const thesis = await Thesis.findByPk(req.params.id);
  if (!thesis) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (thesis.studentId != req.user.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  req.thesis = thesis;
  next();
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
