import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/index.js";

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  const user = await User.findOne({ where: { username: username } });
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
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
