import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Topic, Thesis } from "../models/index.js";

dotenv.config();

export async function checkAuth(req, res, next) {
  const authHeader = req.headers["authorization"]; // The header is "Authorization: Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token received:", token);
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  // TODO
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    req.userRole = jwt.verify(token, process.env.JWT_SECRET).role;
    if (!req.userId || !req.userRole) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
    console.log(`Authenticated user ${req.userId} (${req.userRole})`);
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}

export async function allowSameUserOnly(req, res, next) {
  if (req.userId != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}

export async function allowProfessorsOnly(req, res, next) {
  if (req.userRole !== "professor") {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}

export async function allowTopicOwnerOnly(req, res, next) {
  const topicId = req.params.id;

  const topic = await Topic.findByPk(topicId);

  if (!topic) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  if (topic.professorId !== req.userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}

export async function allowThesisOwnerOnly(req, res, next) {
  const thesisId = req.params.id;

  const thesis = await Thesis.findByPk(thesisId);

  if (!thesis) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  if (thesis.studentId !== req.userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  // const isOwner = await checkThesisOwnership(req.userId, thesisId);
  // if (!isOwner) {
  // return res.status(StatusCodes.FORBIDDEN).send();
  // }
  next();
}
