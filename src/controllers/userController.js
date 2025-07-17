import { StatusCodes } from "http-status-codes";
import { Professor, User, Student, Secretary } from "../models.js";

export async function queryUsers(req, res) {
  const users = await User.findAll({
    attributes: ["id", "name", "username", "email", "role"],
    where: {
      role: req.query.role,
    },
    limit: req.query.limit,
    offset: req.query.offset,
  });

  res.status(StatusCodes.OK).json(users);
}

export async function getUser(req, res) {
  if (req.userId != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  const user = await User.findByPk(req.params.id, {
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
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  res.status(StatusCodes.OK).json(user);
}

export async function patchUser(req, res) {
  if (req.userId != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  await user.update(req.body);

  res.status(StatusCodes.OK).json(user);
}

export async function deleteUser(req, res) {
  if (req.userId != req.params.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }

  await user.destroy();

  res.status(StatusCodes.NO_CONTENT).send();
}
