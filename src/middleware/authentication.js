import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { User, CommitteeMember, Thesis } from "../models/index.js";
import { ThesisRole } from "../constants.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"]; // The header is "Authorization: Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token received:", token);
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  try {
    const id = jwt.verify(token, process.env.JWT_SECRET).id;
    if (!id) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    }
    req.user = user;
    console.log(`Authenticated user ${req.user.id} (${req.user.role})`);
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }
    next();
  };
}

export function requireOwner() {
  return async (req, res, next) => {
    const owner = await req.model.getUser();
    if (owner.id !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }

    next();
  };
}

export function requireThesisRole(...roles) {
  return async (req, res, next) => {
    const thesis =
      req.thesis instanceof Thesis ? req.model : await req.model.getThesis();

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
