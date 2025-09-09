import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";

import { extractTokenFromRequest } from "../util.js";

export async function requireAuth(req, res, next) {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json();
  }
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json();
    }
    next();
  };
}

export function requireProfessorOwner() {
  return async (req, res, next) => {
    const owner = await req.model.getProfessor();
    const professor = await req.user.getProfessor();

    if (!professor || professor.id !== owner.id) {
      return res.status(StatusCodes.FORBIDDEN).json();
    }

    next();
  };
}
