import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { StatusCodes } from "http-status-codes";
import db from "../models/index.js";

export async function login(req, res) {
  const user = await db.User.findOne({
    where: { username: req.body.username },
  });

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isPasswordValid) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  console.log(`User ${user.username} logged in successfully.`);
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(StatusCodes.OK).json({ token });
}

export async function logout(req, res) {
  // TODO WONTFIX
  res.status(StatusCodes.IM_A_TEAPOT).json({
    message:
      "Logout not implemented, please clear the token on the client side. See https://jwt.io/ for more information.",
  });
}

export async function refresh(req, res) {
  // TODO WONTFIX: Implement refresh token logic
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    message: "Refresh token not implemented yet.",
  });
}
