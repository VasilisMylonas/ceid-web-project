import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";

import { extractTokenFromRequest } from "../util.js";

export async function requireAuth(req, res, next) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return res.error(
      "Missing authorization, please set Authorization: Bearer <token> or the token=<token> cookie",
      StatusCodes.UNAUTHORIZED
    );
  }

  const user = await AuthService.verifyToken(token);
  if (!user) {
    return res.error("Expired or invalid token", StatusCodes.UNAUTHORIZED);
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
