import { StatusCodes } from "http-status-codes";
import { omit } from "../util.js";
import UserService from "../services/user.service.js";

export default class UserController {
  static async query(req, res) {
    const { users, total } = await UserService.query(req.query);
    res.success(users, { total, count: users.length });
  }

  static async postBatch(req, res) {
    const created = await UserService.createMany(req.body);
    return res.success(created.map((user) => omit(user, "password")));
  }

  static async post(req, res) {
    const created = await UserService.createOne(req.body);
    res.success(omit(created, "password"));
  }

  static async get(req, res) {
    const user = await UserService.getById(req.params.id);

    if (!user) {
      return res.error("No such user", StatusCodes.NOT_FOUND);
    }

    res.success(user);
  }

  static async patch(req, res) {
    const user = await UserService.updateById(req.params.id, req.body);

    if (!user) {
      return res.error("No such user", StatusCodes.NOT_FOUND);
    }

    res.success(user);
  }

  static async delete(req, res) {
    // TODO WONTFIX: delete user dependencies (professor, secretary, student)
    res.error("Not implemented", StatusCodes.NOT_IMPLEMENTED);
  }
}
