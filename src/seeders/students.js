import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { UserRole } from "../constants.js";

export async function up() {
  const count = 30;
  const students = [];

  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const phone = faker.phone.number();
    const am = 1100000 + i;
    const username = `up${am}`;
    const email = `up${am}@ac.upatras.gr`;

    students.push({
      id: i + 30001,
      username,
      name,
      email,
      am,
      phone,
      password: "xxx",
      role: UserRole.STUDENT,
    });
  }

  await db.User.bulkCreate(students, {
    fields: ["id", "username", "name", "email", "password", "phone", "role"],
  });

  await db.Student.bulkCreate(students, {
    fields: ["id", "am"],
  });
}
