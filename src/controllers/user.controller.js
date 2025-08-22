import { StatusCodes } from "http-status-codes";
import db, { Professor, User, Student, Secretary } from "../models/index.js";
import { UserRole } from "../constants.js";
import bcrypt from "bcrypt";
import { omit } from "../util.js";

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

  static async _add(user, transaction) {
    user.password = bcrypt.hash(user.password, 10);

    const created = await User.create(user, { transaction });

    switch (user.role) {
      case UserRole.PROFESSOR:
        await Professor.create({ id: created.id }, { transaction });
        break;
      case UserRole.SECRETARY:
        await Secretary.create({ id: created.id }, { transaction });
        break;
      case UserRole.STUDENT:
        await Student.create({ id: created.id, am: user.am }, { transaction });
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
    let extra = {};

    switch (req.user.role) {
      case UserRole.SECRETARY:
        extra = await Secretary.findByPk(req.user.id);
        break;
      case UserRole.PROFESSOR:
        extra = await Professor.findByPk(req.user.id);
        break;
      case UserRole.STUDENT:
        extra = await Student.findByPk(req.user.id);
        break;
    }

    const data = omit(
      { ...req.user.get(), ...(extra ? extra.get() : {}) },
      "password"
    );
    res.status(StatusCodes.OK).json(data);
  }

  static async patch(req, res) {
    await req.user.update(req.body);
    res.status(StatusCodes.OK).json(req.user);
  }

  static async delete(req, res) {
    await req.user.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
