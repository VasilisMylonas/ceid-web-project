import db from "../models/index.js";
import { NotFoundError } from "../errors.js";
import { UserRole } from "../constants.js";

export default class UserService {
  static async get(id) {
    const user = await db.User.findByPk(id, {
      include: [
        { model: db.Professor },
        { model: db.Student },
        { model: db.Secretary },
      ],
    });
    if (!user) {
      throw new NotFoundError("No such user");
    }
    return user;
  }

  static async query({ limit, offset, role }) {
    const users = await db.User.findAndCountAll({
      attributes: ["id", "name", "email", "role"],
      limit,
      offset,
      order: [["id", "ASC"]],
      where: {
        ...(role && { role }),
      },
      raw: true,
    });

    return { users: users.rows, total: users.count };
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

  static async create(data) {
    const transaction = await db.sequelize.transaction();

    try {
      const created = await UserService._create(data, transaction);
      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, data) {
    const user = await UserService.get(id);
    await user.update(data);
    return user;
  }

  static async _create(user, transaction) {
    const created = await db.User.create(user, { transaction });

    // TODO: This used to attach these as properties but it was causing problems
    switch (user.role) {
      case UserRole.PROFESSOR:
        await db.Professor.create(
          { userId: created.id, division: user.division },
          { transaction }
        );
        break;
      case UserRole.SECRETARY:
        await db.Secretary.create({ userId: created.id }, { transaction });
        break;
      case UserRole.STUDENT:
        await db.Student.create(
          { userId: created.id, am: user.am },
          { transaction }
        );
        break;
    }

    return created;
  }
}
