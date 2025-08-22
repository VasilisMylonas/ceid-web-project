import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { UserRole } from "../constants.js";

export default async function seedSecretaries(count) {
  const secretaries = [];

  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
      provider: "upatras.gr",
    });
    const username = email.split("@")[0];
    const phone = faker.phone.number();

    secretaries.push({
      id: i + 10001,
      username,
      name,
      email,
      phone,
      password: "xxx",
      role: UserRole.SECRETARY,
    });
  }

  await db.User.bulkCreate(secretaries, {
    fields: ["id", "username", "name", "email", "password", "phone", "role"],
  });

  await db.Secretary.bulkCreate(secretaries, {
    fields: ["id"],
  });
}
