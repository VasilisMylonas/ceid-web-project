import { Op, Sequelize } from "sequelize";
import db from "../models/index.js";
import { StatusCodes } from "http-status-codes";

export async function queryStudents(req, res) {
  const students = await db.Student.findAll({
    limit: req.query.limit,
    offset: req.query.offset,
    attributes: [
      "id",
      "am",
      [Sequelize.col("User.name"), "name"],
      [Sequelize.col("User.email"), "email"],
    ],
    where: {
      [Op.or]: [
        Sequelize.where(Sequelize.fn("lower", Sequelize.col("am")), {
          [Op.like]: `%${req.query.q.toLowerCase()}%`,
        }),
        Sequelize.where(Sequelize.fn("lower", Sequelize.col("User.name")), {
          [Op.like]: `%${req.query.q.toLowerCase()}%`,
        }),
      ],
    },
    include: [
      {
        attributes: [],
        model: db.User,
      },
    ],
  });

  res.status(StatusCodes.OK).json(students);
}
