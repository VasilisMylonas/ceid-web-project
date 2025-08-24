import { StatusCodes } from "http-status-codes";
import db, { Professor, User, Student, Secretary } from "../models/index.js";
import { UserRole } from "../constants.js";
import bcrypt from "bcrypt";
import { omit } from "../util.js";

export default class UserController {
  static async query(req, res) {
    const users = await User.findAll({
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

  static async _add(user, transaction) {
    user.password = bcrypt.hash(user.password, 10);

    const created = await User.create(user, { transaction });

    switch (user.role) {
      case UserRole.PROFESSOR:
        await Professor.create({ userId: created.id }, { transaction });
        break;
      case UserRole.SECRETARY:
        await Secretary.create({ userId: created.id }, { transaction });
        break;
      case UserRole.STUDENT:
        await Student.create(
          { userId: created.id, am: user.am },
          { transaction }
        );
        break;
    }

    return created;
  }

  static async putAll(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      for (const user of req.body) {
        this._add(user, transaction);
      }
      transaction.commit();
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  static async post(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const created = this._add(req.body, transaction);
      transaction.commit();
      res.status(StatusCodes.CREATED).json(omit(created.get(), "password"));
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  static async get(req, res) {
    const data = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Professor }, { model: Student }, { model: Secretary }],
    });

    res.status(StatusCodes.OK).json(data);
  }

  static async patch(req, res) {
    await req.targetUser.update(req.body);

    const data = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Professor }, { model: Student }, { model: Secretary }],
    });

    res.status(StatusCodes.OK).json(data);
  }

  static async delete(req, res) {
    // TODO WONTFIX: delete user dependencies (professor, secretary, student)
    res.status(StatusCodes.NOT_IMPLEMENTED).send();
  }
}
