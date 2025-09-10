import { StatusCodes } from "http-status-codes";
import db from "../models/index.js";
import { UserRole } from "../constants.js";
import bcrypt from "bcrypt";
import { omit } from "../util.js";

export default class UserController {
  static async query(req, res) {
    const users = await db.User.findAll({
      attributes: ["id", "name", "email", "role"],
      limit: req.query.limit,
      offset: req.query.offset,
      order: [["id", "ASC"]],
      where: {
        ...(req.query.role && { role: req.query.role }),
      },
    });
    res.status(StatusCodes.OK).json(users);
  }

  static async _createUser(user, transaction) {
    // Hash password before storing
    user.password = JSON.stringify(bcrypt.hash(user.password, 10));

    const created = await db.User.create(user, { transaction });

    switch (user.role) {
      case UserRole.PROFESSOR:
        created.Professor = await db.Professor.create(
          { userId: created.id, division: user.division },
          { transaction }
        );
        break;
      case UserRole.SECRETARY:
        created.Secretary = await db.Secretary.create(
          { userId: created.id },
          { transaction }
        );
        break;
      case UserRole.STUDENT:
        created.Student = await db.Student.create(
          { userId: created.id, am: user.am },
          { transaction }
        );
        break;
    }

    return created;
  }

  static async postBatch(req, res) {
    const transaction = await db.sequelize.transaction();

    const created = [];

    try {
      for (const user of req.body) {
        created.push(await UserController._createUser(user, transaction));
      }

      transaction.commit();
      return res
        .status(StatusCodes.CREATED)
        .json(created.map((user) => omit(user.get(), "password")));
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  static async post(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const created = await UserController._createUser(req.body, transaction);
      transaction.commit();
      res.status(StatusCodes.CREATED).json(omit(created.get(), "password"));
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  static async get(req, res) {
    const data = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: db.Professor },
        { model: db.Student },
        { model: db.Secretary },
      ],
    });

    res.status(StatusCodes.OK).json(data);
  }

  static async patch(req, res) {
    await req.targetUser.update(req.body);

    const data = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: db.Professor },
        { model: db.Student },
        { model: db.Secretary },
      ],
    });

    res.status(StatusCodes.OK).json(data);
  }

  static async delete(req, res) {
    // TODO WONTFIX: delete user dependencies (professor, secretary, student)
    res.status(StatusCodes.NOT_IMPLEMENTED).json();
  }
}
