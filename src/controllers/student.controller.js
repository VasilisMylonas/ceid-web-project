import { Op, Sequelize } from "sequelize";
import { Student, User } from "../models/index.js";
import { StatusCodes } from "http-status-codes";

export async function queryStudents(req, res) {
  const students = await Student.findAll({
    limit: req.query.limit,
    offset: req.query.offset,
    attributes: [
      "id",
      "am",
      [Sequelize.col("user.name"), "name"],
      [Sequelize.col("user.email"), "email"],
    ],
    where: {
      [Op.or]: [
        Sequelize.where(Sequelize.fn("lower", Sequelize.col("am")), {
          [Op.like]: `%${req.query.search.toLowerCase()}%`,
        }),
        Sequelize.where(Sequelize.fn("lower", Sequelize.col("user.name")), {
          [Op.like]: `%${req.query.search.toLowerCase()}%`,
        }),
      ],
    },
    include: [
      {
        attributes: [],
        model: User,
      },
    ],
  });

  res.status(StatusCodes.OK).json(students);
}
