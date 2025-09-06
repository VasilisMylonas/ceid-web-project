import db from "../models/index.js";
import bcrypt from "bcrypt";
import { UserRole } from "../constants.js";
import seedProfessors from "./professors.js";
import seedStudents from "./students.js";
import seedSecretaries from "./secretaries.js";
import seedTopics from "./topics.js";
import seedTheses from "./theses.js";

export default async function seedDatabase() {
  await db.sequelize.sync({ force: true });
  await Promise.all([seedProfessors(10), seedStudents(50), seedSecretaries(4)]);

  const professorUser = await db.User.create({
    username: "professor",
    password: await bcrypt.hash("professor", 10),
    email: "professor@example.com",
    name: "Test Professor",
    role: UserRole.PROFESSOR,
    phone: "6942023594",
  });
  const studentUser = await db.User.create({
    username: "student",
    password: await bcrypt.hash("student", 10),
    email: "student@example.com",
    name: "Test Student",
    role: UserRole.STUDENT,
    phone: "6942023594",
  });
  const secretaryUser = await db.User.create({
    username: "secretary",
    password: await bcrypt.hash("secretary", 10),
    email: "secretary@example.com",
    name: "Test Secretary",
    role: UserRole.SECRETARY,
    phone: "6942023594",
  });

  await db.Professor.create({
    userId: professorUser.id,
    division: "Software Engineering",
  });
  await db.Student.create({
    userId: studentUser.id,
    am: "1100491",
  });
  await db.Secretary.create({
    userId: secretaryUser.id,
  });

  await seedTopics(60);
  await seedTheses(40);
}
