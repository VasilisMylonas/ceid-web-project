import { faker } from "@faker-js/faker";
import db from "../models/index.js";
import { UserRole } from "../constants.js";

export default async function seedSecretaries(count) {
  const users = [];

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

    users.push({
      username,
      name,
      email,
      address,
      password: "xxx",
      phone,
      role: UserRole.SECRETARY,
    });
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

  const secretaries = createdUsers.map((user) => ({
    userId: user.id,
  }));

  await db.Secretary.bulkCreate(secretaries, {
    fields: ["userId"],
  });
}
