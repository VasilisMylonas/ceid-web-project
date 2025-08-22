import { StatusCodes } from "http-status-codes";
import { Professor, User, Student, Secretary } from "../models/index.js";

export default class UserController {
  static async query(req, res) {
    let query = {
      attributes: ["id", "name", "username", "email", "role"],
      limit: req.query.limit,
      offset: req.query.offset,
      order: [["id", "ASC"]],
      where: {
        ...(req.query.role && { role: req.query.role }),
      },
    };
    const users = await User.findAll(query);
    res.status(StatusCodes.OK).json(users);
  }

  static async get(req, res) {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Professor }, { model: Student }, { model: Secretary }],
    });
    res.status(StatusCodes.OK).json(user);
  }

  static async patch(req, res) {
    console.log(req.body);
    await req.user.update(req.body);
    res.status(StatusCodes.OK).json(req.user);
  }

  static async delete(req, res) {
    await req.user.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
