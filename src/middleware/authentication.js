import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

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

export function requireProfessorOwner() {
  return async (req, res, next) => {
    const owner = await req.model.getProfessor();
    const professor = await req.user.getProfessor();

    if (!professor || professor.id !== owner.id) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }

    next();
  };
}
