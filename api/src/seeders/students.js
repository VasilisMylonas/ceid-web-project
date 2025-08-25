import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { UserRole } from "../constants.js";

export default async function seedStudents(count) {
  const users = [];
  const ams = [];

  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const phone = faker.phone.number();
    const am = 1100000 + i;
    const username = `up${am}`;
    const email = `up${am}@ac.upatras.gr`;

    users.push({
      username,
      name,
      email,
      password: "xxx",
      phone,
      role: UserRole.STUDENT,
    });
    ams.push(am);
  }

  const createdUsers = await db.User.bulkCreate(users, {
    fields: ["username", "name", "email", "password", "phone", "role"],
  });

  const students = createdUsers.map((user, idx) => ({
    userId: user.id,
    am: ams[idx],
  }));

  await db.Student.bulkCreate(students, {
    fields: ["userId", "am"],
  });
}
