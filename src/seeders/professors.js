import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { UserRole } from "../constants.js";

export default async function seedProfessors(count) {
  const users = [];
  const divisions = [];

  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
      provider: "upatras.gr",
    });
    const username = email.split("@")[0];
    const phone = faker.phone.number();
    const address = faker.location.streetAddress();

    const division = faker.helpers.arrayElement([
      "Software Engineering",
      "Telecommunication Engineering",
      "Hardware Engineering",
      "Algorithms and Data Structures",
      "Information Engineering",
    ]);

    users.push({
      username,
      name,
      email,
      address,
      password: "xxx",
      phone,
      role: UserRole.PROFESSOR,
    });
    divisions.push(division);
  }

  const createdUsers = await db.User.bulkCreate(users, {
    fields: [
      "username",
      "name",
      "email",
      "password",
      "phone",
      "role",
      "address",
    ],
  });

  const professors = createdUsers.map((user, idx) => ({
    userId: user.id,
    division: divisions[idx],
  }));

  await db.Professor.bulkCreate(professors, {
    fields: ["userId", "division"],
  });
}
