import db from "../models/index.js";
import bcrypt from "bcrypt";

export default class UserService {
  static async getById(id) {
    return db.User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: db.Professor },
        { model: db.Student },
        { model: db.Secretary },
      ],
    });
  }

  static async updateById(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await UserService.getById(id);

    if (!user) {
      return null;
    }

    await user.update(data);

    return user;
  }

  static async query({ limit, offset, role }) {
    const users = await db.User.findAll({
      attributes: ["id", "name", "email", "role"],
      limit,
      offset,
      order: [["id", "ASC"]],
      where: {
        ...(role && { role }),
      },
      raw: true,
    });

    const total = await db.User.count();

    return { users, total, count: users.length };
  }

  static async createMany(users) {
    const transaction = await db.sequelize.transaction();

    try {
      const created = [];
      for (const user of users) {
        created.push(await this._create(user, transaction));
      }

      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async createOne(user) {
    const transaction = await db.sequelize.transaction();

    try {
      const created = await UserService._create(user, transaction);
      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async _create(user, transaction) {
    // Hash password before storing
    user.password = await bcrypt.hash(user.password, 10);

    const created = await db.User.create(user, { transaction });

    switch (user.role) {
      case "PROFESSOR":
        created.Professor = await db.Professor.create(
          { userId: created.id, division: user.division },
          { transaction }
        );
        break;
      case "SECRETARY":
        created.Secretary = await db.Secretary.create(
          { userId: created.id },
          { transaction }
        );
        break;
      case "STUDENT":
        created.Student = await db.Student.create(
          { userId: created.id, am: user.am },
          { transaction }
        );
        break;
    }

    return created;
  }
}
