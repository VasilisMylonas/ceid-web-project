import { StatusCodes } from "http-status-codes";
import { Professor, User, Student, Secretary } from "../models/index.js";
import Joi from "joi";

export async function getUserInfo(req, res) {
  const user = await User.findByPk(req.userId, {
    attributes: { exclude: ["password"] }, // Exclude password from response
    include: [
      {
        model: Professor,
      },
      {
        model: Student,
      },
      {
        model: Secretary,
      },
    ],
  });

  if (!user) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }

  res.status(StatusCodes.OK).json(user);
}

export async function queryUsers(req, res) {
  const querySchema = Joi.object({
    role: Joi.string().valid("student", "professor", "secretary").optional(),
    limit: Joi.number().integer().positive().optional(),
  });

  const { error, value } = querySchema.validate(req.query);

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message });
  }

  const users = await User.findAll({
    attributes: { exclude: ["password"] }, // Exclude password from response
    include: [
      {
        model: Professor,
      },
      {
        model: Student,
      },
      {
        model: Secretary,
      },
    ],
    where: {
      role: value.role,
    },
    limit: value.limit,
  });

  res.status(StatusCodes.OK).json(users);
}
