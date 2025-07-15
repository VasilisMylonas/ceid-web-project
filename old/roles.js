import { StatusCodes } from "http-status-codes";
// import User from "../models/User.js";

// TODO

export async function professorOnly(req, res, next) {
  const user = await User.findByPk(req.auth.id);

  if (user.role !== "professor" && user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}

export async function studentOnly(req, res, next) {
  const user = await User.findByPk(req.auth.id);

  if (user.role !== "student" && user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  next();
}

export async function adminOnly(req, res, next) {
  const user = await User.findByPk(req.auth.id);

  if (user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
}
