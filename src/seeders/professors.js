import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { UserRole } from "../constants.js";

export default async function seedProfessors(count) {
  const professors = [];

  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
      provider: "upatras.gr",
    });
    const username = email.split("@")[0];
    const phone = faker.phone.number();

    const division = faker.helpers.arrayElement([
      "Software Engineering",
      "Telecommunication Engineering",
      "Hardware Engineering",
      "Algorithms and Data Structures",
      "Information Engineering",
    ]);

    professors.push({
      id: i + 20001,
      username,
      name,
      email,
      division,
      phone,
      password: "xxx",
      role: UserRole.PROFESSOR,
    });
  }

  await db.User.bulkCreate(professors, {
    fields: ["id", "username", "name", "email", "password", "phone", "role"],
  });

  await db.Professor.bulkCreate(professors, {
    fields: ["id", "division"],
  });
}
