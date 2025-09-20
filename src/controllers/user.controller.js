import { StatusCodes } from "http-status-codes";
import { omit } from "../util.js";
import UserService from "../services/user.service.js";
import db from "../models/index.js";
import { UserRole } from "../constants.js";
import Sequelize from "sequelize";

export default class UserController {
  static async query(req, res) {
    const { users, total } = await UserService.query(req.query);
    res.success(users, { total, count: users.length });
  }

  static async getProfessors(req, res) {
    const professors = await db.User.findAll({
      where: {
        role: UserRole.PROFESSOR,
      },
      attributes: [
        "id",
        "name",
        [Sequelize.col("Professor.id"), "professorId"],
      ], // Return only ID and name
      order: [["name", "ASC"]], // Order alphabetically by name
      include: [
        {
          model: db.Professor,
          attributes: [],
        },
      ],
    });

    res.success(professors);
  }

  static async postBatch(req, res) {
    const created = await UserService.createMany(req.body);
    res.success(
      created.map((user) => omit(user.get(), "password")),
      {},
      StatusCodes.CREATED
    );
  }

  static async post(req, res) {
    const created = await UserService.create(req.body);
    res.success(omit(created.get(), "password"), {}, StatusCodes.CREATED);
  }

  static async get(req, res) {
    const user = await UserService.get(req.params.id);
    res.success(omit(user.get(), "password"));
  }

  static async patch(req, res) {
    const user = await UserService.update(req.params.id, req.body);
    res.success(omit(user.get(), "password"));
  }

  static async delete(req, res) {
    // WONTFIX: delete user dependencies (professor, secretary, student)
    res.error("Not implemented", StatusCodes.NOT_IMPLEMENTED);
  }
}
