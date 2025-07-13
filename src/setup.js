import { sequelize } from "./config/db.js";

import User from "./models/User.js";
import Topic from "./models/Topic.js";
import bcrypt from "bcrypt";
import { faker, fakerEL } from "@faker-js/faker";

export async function setupDatabase() {
  // Test database connection
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }

  // Sync models
  try {
    await sequelize.sync({ force: true }); // TODO: Remove force in production
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }

  // Create dummy admin user
  await User.create({
    username: "admin",
    password: await bcrypt.hash("admin", 10),
    role: "admin",
    email: "admin@example.com",
  });

  const dummyUsers = [];

  for (let i = 0; i < 10; i++) {
    dummyUsers.push({
      username: faker.internet.username(),
      password: await bcrypt.hash("password", 10),
      role: faker.helpers.arrayElement(["student", "professor"]),
      email: faker.internet.email(),
      name: fakerEL.person.fullName(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await User.bulkCreate(dummyUsers);

  const dummyTopics = [];

  for (let i = 0; i < 20; i++) {
    dummyTopics.push({
      professorId: faker.number.int({ min: 2, max: 11 }),
      title: faker.lorem.sentence(),
      summary: faker.lorem.paragraph(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await Topic.bulkCreate(dummyTopics);
}
