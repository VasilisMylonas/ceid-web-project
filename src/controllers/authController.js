import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { StatusCodes } from "http-status-codes";
import { User } from "../models.js";

export async function login(req, res) {
  const user = await User.findOne({ where: { username: req.body.username } });

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

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(StatusCodes.OK).json({ token });
}

export async function logout(req, res) {
  res
    .status(StatusCodes.IM_A_TEAPOT)
    .send(
      "Logout not implemented, please clear the token on the client side. See https://jwt.io/ for more information."
    );
}
