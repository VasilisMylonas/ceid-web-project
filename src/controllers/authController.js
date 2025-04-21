import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  try {
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
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}
