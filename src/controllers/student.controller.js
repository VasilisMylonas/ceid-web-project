import { Op } from "sequelize";
import { Student, User } from "../models/index.js";

export async function queryStudents(req, res) {
  const students = await Student.findAll({
    limit: req.query.limit,
    offset: req.query.offset,
    attributes: ["id", "am"],
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
        attributes: ["name", "email"],
        model: User,
        required: true,
      },
    ],
  });

  res.status(200).json(students);
}
