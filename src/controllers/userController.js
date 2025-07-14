import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

export async function getUserInfo(req, res) {
  const userId = req.auth.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}

export async function getProfessors(req, res) {
  try {
    const professors = await User.findAll({
      where: { role: "professor" },
      attributes: ["id", "name", "email"],
    });

    res.status(StatusCodes.OK).json(professors);
  } catch (error) {
    console.error("Error fetching professors:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}
