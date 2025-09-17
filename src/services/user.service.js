import db from "../models/index.js";
import bcrypt from "bcrypt";

export default class UserService {
  /**
   * Retrieve a user by their ID including role-specific models.
   * @param {number} id - The user ID.
   * @returns {Promise<Object|null>} The user object or null if not found.
   */
  static async getById(id) {
    return db.User.findByPk(id, {
      include: [
        { model: db.Professor },
        { model: db.Student },
        { model: db.Secretary },
      ],
    });
  }

  /**
   * Update a user by ID. Hashes password if provided.
   * @param {number} id - The user ID.
   * @param {Object} data - The fields to update.
   * @returns {Promise<Object|null>} The updated user or null if not found.
   */
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

  /**
   * Query users with optional pagination and role filtering.
   * @param {Object} params - Query parameters.
   * @param {number} params.limit - Max number of users to return.
   * @param {number} params.offset - Number of users to skip.
   * @param {string} [params.role] - Optional role to filter by.
   * @returns {Promise<{users: Object[], total: number}>}
   */
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

  /**
   * Create multiple users in a transaction, including their role-specific models.
   * @param {Object[]} users - Array of user objects.
   * @returns {Promise<Object[]>} Array of created user objects.
   */
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

  /**
   * Create a single user in a transaction, including their role-specific model.
   * @param {Object} user - The user object.
   * @returns {Promise<Object>} The created user object.
   */
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

  /**
   * Internal helper to create a user and their role-specific model in a transaction.
   * Password is hashed before storing.
   * @param {Object} user - The user object.
   * @param {Object} transaction - The Sequelize transaction.
   * @returns {Promise<Object>} The created user object.
   * @private
   */
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
