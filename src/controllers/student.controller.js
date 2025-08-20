import { Op, Sequelize } from "sequelize";
import { Student, User } from "../models/index.js";

export async function queryStudents(req, res) {
  const students = await Student.findAll({
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
        {
          am: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
        {
          "$User.name$": {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
      ],
    },
    include: [
      {
        attributes: [],
        model: User,
      },
    ],
  });

  res.status(200).json(students);
}
