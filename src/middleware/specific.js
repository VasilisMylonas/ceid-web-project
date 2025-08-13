import { StatusCodes } from "http-status-codes";
import { Topic, Thesis, User } from "../models/index.js";

export async function manageUser(req, res, next) {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (user.id !== req.userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}

export async function manageTopic(req, res, next) {
  const topic = await Topic.findByPk(req.params.id);
  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (topic.professorId !== req.userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}

export async function manageThesis(req, res, next) {
  const thesis = await Thesis.findByPk(req.params.id);
  if (!thesis) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (thesis.studentId !== req.userId && thesis.professorId !== req.userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}

export async function allowThesisOwnerOnly(req, res, next) {
  const thesis = await Thesis.findByPk(req.params.id);
  if (!thesis) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  if (thesis.studentId !== req.userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}
