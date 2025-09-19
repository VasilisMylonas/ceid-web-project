import { Op, Sequelize } from "sequelize";
import db from "../models/index.js";
import { StatusCodes } from "http-status-codes";
import { ThesisStatus } from "../constants.js";

export async function queryStudents(req, res) {
  // Assigned
  const where = {};

  if (req.query.q) {
    where[Op.or] = [
      Sequelize.where(Sequelize.fn("lower", Sequelize.col("am")), {
        [Op.like]: `%${req.query.q.toLowerCase()}%`,
      }),
      Sequelize.where(Sequelize.fn("lower", Sequelize.col("User.name")), {
        [Op.like]: `%${req.query.q.toLowerCase()}%`,
      }),
    ];
  }

  const students = await db.Student.findAll({
    limit: req.query.limit,
    offset: req.query.offset,
    attributes: [
      "id",
      "am",
      [Sequelize.col("User.name"), "name"],
      [Sequelize.col("User.email"), "email"],
    ],
    where,
    include: [
      {
        attributes: [],
        model: db.User,
      },
    ],
  });

  let filteredStudents = [];

  if (req.query.assigned && req.query.assigned === "false") {
    for (const student of students) {
      if (!(await student.isAssigned())) {
        filteredStudents.push(student);
      }
    }
  } else {
    filteredStudents = students;
  }

  res.success(filteredStudents);
}
